class App::Services::Orders < App::Services::Base
  def model; Order; end

  def place_order
    return_errors!('address_id is required', 400) if params[:address_id].blank?

    uid  = current_user[:id]
    cart = Cart.where(user_id: uid).first
    return_errors!('Your cart is empty', 422) if cart.nil?

    # Fetch cart items BEFORE the transaction so return_errors! never runs inside a transaction
    cart_items = cart.cart_items_dataset.all
    return_errors!('Your cart is empty', 422) if cart_items.empty?

    address = Address.where(id: params[:address_id].to_i, user_id: uid, active: true).first
    return_errors!('Address not found', 404) unless address

    # Pre-validate coupon before entering the transaction (return_errors! can't run inside)
    coupon_code = params[:coupon_code].to_s.strip.upcase
    if coupon_code.present?
      pre_coupon = Coupon.where(code: coupon_code, active: true).first
      return_errors!("Coupon '#{coupon_code}' is invalid or inactive", 422) unless pre_coupon
      return_errors!('This coupon has expired', 422) if pre_coupon.expires_at && pre_coupon.expires_at < Time.now
      return_errors!('This coupon has reached its usage limit', 422) if pre_coupon.max_uses && pre_coupon.used_count >= pre_coupon.max_uses
    end

    just_went_out_of_stock = []

    result = begin
      App.db.transaction do
        # Lock all product rows FOR UPDATE to prevent concurrent overselling
        locked = {}
        cart_items.each do |ci|
          p = Product.where(id: ci.product_id).for_update.first
          raise "A product in your cart no longer exists" unless p
          raise "#{p.name} is out of stock" if p.is_out_of_stock || p.stock < 1
          raise "Only #{p.stock} #{p.unit} of #{p.name} left" if p.stock < ci.quantity
          raise "#{p.name} has no price set. Please contact support." if p.price.to_i <= 0
          locked[ci.product_id] = p
        end

        subtotal = cart_items.sum { |ci| locked[ci.product_id].price * ci.quantity }

        # Minimum order check
        min_rupees = Setting.get_int('min_order_amount', 0)
        raise "Minimum order amount is ₹#{min_rupees}" if min_rupees > 0 && subtotal < min_rupees * 100

        # Delivery fee
        free_above = Setting.get_int('free_delivery_above', 500)
        fee_rupees = Setting.get_int('delivery_fee', 40)
        delivery_fee = (free_above > 0 && subtotal >= free_above * 100) ? 0 : fee_rupees * 100

        # Apply coupon atomically with FOR UPDATE
        discount      = 0
        applied_code  = nil
        if coupon_code.present?
          c = Coupon.where(code: coupon_code).for_update.first
          raise "Coupon is no longer available" unless c&.active
          raise "Coupon has expired" if c.expires_at && c.expires_at < Time.now
          raise "Coupon usage limit reached" if c.max_uses && c.used_count >= c.max_uses
          raise "Minimum order ₹#{c.min_order_amount} required for this coupon" if subtotal < c.min_order_amount * 100
          discount     = c.discount_amount_paise(subtotal)
          applied_code = c.code
          c.update(used_count: c.used_count + 1)
        end

        total = subtotal + delivery_fee - discount

        order = Order.create(
          user_id:         uid,
          address_id:      address.id,
          subtotal_amount: subtotal,
          delivery_fee:    delivery_fee,
          discount_amount: discount,
          coupon_code:     applied_code,
          total_amount:    total,
          status:          'placed',
          payment_method:  'cod',
          notes:           params[:notes]
        )
        raise 'Failed to create order. Please try again.' unless order && order.id

        cart_items.each do |ci|
          product   = locked[ci.product_id]
          old_stock = product.stock
          new_stock = old_stock - ci.quantity
          oi = OrderItem.create(
            order_id:   order.id,
            product_id: product.id,
            quantity:   ci.quantity,
            unit_price: product.price,
            unit:       product.unit
          )
          unless oi && oi.id
            App.logger.error("OrderItem.create failed for product #{product.id} on order #{order.id}")
            raise "Failed to save item for #{product.name}. Please try again."
          end
          product.update(stock: new_stock, is_out_of_stock: new_stock <= 0)
          # Track products that just hit zero so we can send an immediate alert after the transaction
          just_went_out_of_stock << product.reload if old_stock > 0 && new_stock <= 0
        end

        CartItem.where(cart_id: cart.id).delete
        order.reload
      end
    rescue => e
      App.logger.error("place_order failed: #{e.class}: #{e.message}")
      return_errors!(e.message, 422)
    end

    begin
      App::WhatsApp.order_confirmation(result)
    rescue => e
      App.logger.error("WhatsApp order_confirmation failed: #{e.message}")
    end

    begin
      App::Mailer.order_confirmation(result)
    rescue => e
      App.logger.error("Email order_confirmation failed: #{e.message}")
    end

    # Notify admin via WhatsApp when a product just hit zero — no auto stock change
    just_went_out_of_stock.each do |product|
      begin
        App::InventoryAnalyzer.immediate_out_of_stock_alert(product)
      rescue => e
        App.logger.error("Out-of-stock alert failed for #{product.name}: #{e.message}")
      end
    end

    # Also run the general low-stock check for warning-level products
    begin
      remaining_ids = cart_items.map(&:product_id) - just_went_out_of_stock.map(&:id)
      App::InventoryAnalyzer.quick_stock_check(remaining_ids) if remaining_ids.any?
    rescue => e
      App.logger.error("Post-order refill check failed: #{e.message}")
    end

    return_success(result.to_pos)
  end

  def list
    uid = current_user[:id]
    ds = model.where(user_id: uid).order(Sequel.desc(:created_at))
    count = ds.count
    orders = ds.offset(offset).limit(limit).eager(:address, order_items: :product).all
    return_success(
      orders.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  def get
    uid = current_user[:id]
    order = model.where(id: rp[:id].to_i, user_id: uid).eager(:address, order_items: :product).first
    return_errors!('Order not found', 404) unless order
    return_success(order.to_pos)
  end

  def admin_list
    ds = model.order(Sequel.desc(:id))
    ds = ds.where(status: qs[:status]) if qs[:status].present?
    count = ds.count
    orders = ds.offset(offset).limit(limit).eager(:user, :address, order_items: :product).all
    return_success(
      orders.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  def admin_get
    order = model[rp[:id].to_i] || return_errors!('Order not found', 404)
    return_success(order.to_pos)
  end

  def reorder
    uid   = current_user[:id]
    order = model.where(id: rp[:id].to_i, user_id: uid).eager(order_items: :product).first
    return_errors!('Order not found', 404) unless order

    cart = Cart.where(user_id: uid).first || Cart.create(user_id: uid)
    return_errors!('Could not create cart', 500) unless cart

    CartItem.where(cart_id: cart.id).delete

    skipped = []
    order.order_items.each do |item|
      product = item.product
      unless product
        skipped << item.values[:product_name] || 'Unknown item'
        next
      end

      if product.is_out_of_stock || product.stock < 1
        skipped << product.name
        next
      end

      qty = [item.quantity, product.stock].min
      existing = CartItem.where(cart_id: cart.id, product_id: product.id).first
      if existing
        existing.update(quantity: existing.quantity + qty)
      else
        CartItem.create(cart_id: cart.id, product_id: product.id, quantity: qty)
      end
    end

    return_success(cart.reload.to_pos, skipped: skipped)
  rescue => e
    App.logger.error("reorder failed: #{e.class}: #{e.message}")
    return_errors!(e.message, 422)
  end

  def cancel_order
    uid   = current_user[:id]
    order = model.where(id: rp[:id].to_i, user_id: uid).first
    return_errors!('Order not found', 404) unless order
    return_errors!("Only orders that are 'Placed' can be cancelled", 422) unless order.status == 'placed'

    App.db.transaction do
      order.order_items_dataset.all.each do |item|
        product = Product.where(id: item.product_id).for_update.first
        next unless product
        new_stock = product.stock + item.quantity
        product.update(stock: new_stock, is_out_of_stock: new_stock <= 0)
      end
      order.update(status: 'cancelled')
      order.reload
    end

    begin
      App::WhatsApp.order_status_update(order)
    rescue => e
      App.logger.error("WhatsApp cancel notification failed: #{e.message}")
    end

    return_success(order.to_pos)
  end

  # Customer submits payment proof after delivery (UPI ref, cash note, etc.)
  # Sets payment_status → 'submitted' so admin can verify and mark paid.
  def confirm_payment
    uid   = current_user[:id]
    order = model.where(id: rp[:id].to_i, user_id: uid).first
    return_errors!('Order not found', 404) unless order
    return_errors!('Order must be delivered before confirming payment', 422) unless order.status == 'delivered'
    return_errors!('Payment has already been confirmed', 422) if order.payment_status == 'paid'

    ref = params[:payment_reference].to_s.strip
    order.set(
      payment_status:    'submitted',
      payment_reference: ref.presence || order.values[:payment_reference]
    )
    if order.save
      return_success(order.reload.to_pos)s
    else
      return_errors!(order.errors, 400)
    end
  end

  # Admin marks payment as verified and paid (after reviewing customer submission)
  def record_payment
    order = model.where(id: rp[:id].to_i).first
    return_errors!('Order not found', 404) unless order
    order.update(
      payment_status:    'paid',
      payment_reference: params[:payment_reference].to_s.strip.presence || order.values[:payment_reference]
    )
    return_success(order.reload.to_pos)
  end

  def update_status
    order = model.where(id: rp[:id].to_i).eager(:address, :user, order_items: :product).first
    return_errors!('Order not found', 404) unless order
    new_status = params[:status]
    unless Order::ORDER_STATUSES.include?(new_status)
      return_errors!("Invalid status: #{new_status}", 422)
    end
    order.update(status: new_status)
    begin
      App::WhatsApp.order_status_update(order)
    rescue => e
      App.logger.error("WhatsApp status_update failed: #{e.message}")
    end
    begin
      App::Mailer.order_status_update(order)
    rescue => e
      App.logger.error("Email status_update failed: #{e.message}")
    end
    return_success(order.to_pos)
  end

  def self.fields
    { save: [:address_id, :notes] }
  end
end

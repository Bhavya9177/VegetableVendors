class App::Services::Cart < App::Services::Base

  def get_cart
    cart = find_or_create_cart
    return_success(cart.to_pos)
  end

  def add_item
    product_id = params[:product_id]&.to_i
    qty = (params[:quantity] || 1).to_i

    return_errors!('product_id is required', 400) if product_id.blank?
    return_errors!('Quantity must be at least 1', 422) if qty < 1

    product = Product[product_id] || return_errors!('Product not found', 404)
    return_errors!('Product is out of stock', 422) if product.is_out_of_stock || product.stock < 1

    cart = find_or_create_cart
    existing = CartItem.where(cart_id: cart.id, product_id: product.id).first

    if existing
      new_qty = existing.quantity + qty
      return_errors!('Insufficient stock', 422) if product.stock < new_qty
      existing.update(quantity: new_qty)
    else
      return_errors!('Insufficient stock', 422) if product.stock < qty
      CartItem.create(cart_id: cart.id, product_id: product.id, quantity: qty)
    end

    return_success(cart.reload.to_pos)
  end

  def update_item
    product_id = params[:product_id]&.to_i
    qty = params[:quantity].to_i

    return_errors!('product_id is required', 400) if product_id.blank?

    cart = find_or_create_cart
    cart_item = CartItem.where(cart_id: cart.id, product_id: product_id).first
    return_errors!('Item not in cart', 404) unless cart_item

    if qty < 1
      cart_item.delete
    else
      product = Product[product_id]
      return_errors!('Insufficient stock', 422) if product && (product.is_out_of_stock || product.stock < qty)
      cart_item.update(quantity: qty)
    end

    return_success(cart.reload.to_pos)
  end

  def remove_item
    product_id = params[:product_id]&.to_i
    return_errors!('product_id is required', 400) if product_id.blank?

    cart = find_or_create_cart
    CartItem.where(cart_id: cart.id, product_id: product_id).delete
    return_success(cart.reload.to_pos)
  end

  def clear
    cart = find_or_create_cart
    CartItem.where(cart_id: cart.id).delete
    return_success(cart.to_pos)
  end

  private

  def find_or_create_cart
    uid = current_user[:id]
    App.db.transaction do
      Cart.where(user_id: uid).first || Cart.create(user_id: uid)
    end
  end
end

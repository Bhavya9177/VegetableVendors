class App::Services::Coupons < App::Services::Base
  def model; Coupon; end

  def admin_list
    ds    = model.order(Sequel.desc(:created_at))
    count = ds.count
    items = ds.offset(offset).limit(limit).all
    return_success(items.map(&:to_pos),
                   total_pages: (count / page_size.to_f).ceil,
                   total: count)
  end

  def create
    code = params[:code].to_s.strip.upcase
    return_errors!('Code is required', 400) if code.blank?
    return_errors!("Coupon '#{code}' already exists", 422) if Coupon.where(code: code).count > 0

    coupon = Coupon.new(
      code:             code,
      discount_type:    params[:discount_type],
      value:            params[:value].to_i,
      min_order_amount: params[:min_order_amount].to_i,
      max_uses:         params[:max_uses].present? ? params[:max_uses].to_i : nil,
      expires_at:       params[:expires_at].present? ? Time.parse(params[:expires_at].to_s) : nil,
      description:      params[:description],
      active:           params[:active].nil? ? true : params[:active]
    )
    save(coupon)
  end

  def update
    coupon = item
    code = params[:code].to_s.strip.upcase

    if code.present? && code != coupon.code
      return_errors!("Code '#{code}' is already in use", 422) if Coupon.where(code: code).exclude(id: coupon.id).count > 0
    end

    updates = {}
    updates[:code]             = code if code.present?
    updates[:discount_type]    = params[:discount_type]            if params[:discount_type].present?
    updates[:value]            = params[:value].to_i               if params[:value].present?
    updates[:min_order_amount] = params[:min_order_amount].to_i    if params.key?(:min_order_amount)
    updates[:max_uses]         = params[:max_uses].present? ? params[:max_uses].to_i : nil if params.key?(:max_uses)
    updates[:expires_at]       = params[:expires_at].present? ? Time.parse(params[:expires_at].to_s) : nil if params.key?(:expires_at)
    updates[:description]      = params[:description]              if params.key?(:description)
    updates[:active]           = params[:active]                   if params.key?(:active)
    updates[:updated_at]       = Time.now

    coupon.set_fields(updates, updates.keys)
    save(coupon)
  end

  def delete
    coupon = item
    coupon.delete
    return_success({ id: coupon.id }, message: 'Coupon deleted')
  end

  # Public (auth required): validate a coupon and preview discount — no usage increment.
  def apply
    code = params[:coupon_code].to_s.strip.upcase
    return_errors!('coupon_code is required', 400) if code.blank?

    subtotal_paise = params[:subtotal].to_i
    return_errors!('subtotal is required', 400) if subtotal_paise <= 0

    coupon = Coupon.where(code: code, active: true).first
    return_errors!('Invalid coupon code', 422) unless coupon
    return_errors!('This coupon has expired', 422) if coupon.expires_at && coupon.expires_at < Time.now
    return_errors!('This coupon has reached its usage limit', 422) if coupon.max_uses && coupon.used_count >= coupon.max_uses
    if subtotal_paise < coupon.min_order_amount * 100
      return_errors!("Minimum order ₹#{coupon.min_order_amount} required for this coupon", 422)
    end

    discount_paise  = coupon.discount_amount_paise(subtotal_paise)
    new_total_paise = [subtotal_paise - discount_paise, 0].max

    return_success({
      valid:           true,
      code:            coupon.code,
      discount_type:   coupon.discount_type,
      value:           coupon.value,
      discount_amount: discount_paise,
      new_total:       new_total_paise,
      description:     coupon.description
    })
  end

  def self.fields
    { save: [:code, :discount_type, :value, :min_order_amount, :max_uses, :expires_at, :description, :active] }
  end
end

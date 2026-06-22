class App::Models::Coupon < Sequel::Model
  DISCOUNT_TYPES = %w[percent flat].freeze

  def validate
    super
    validates_presence  [:code, :discount_type, :value]
    validates_includes  DISCOUNT_TYPES, :discount_type
    errors.add(:value, 'must be positive') if value.to_i <= 0
    errors.add(:value, 'percentage must be between 1 and 100') if discount_type == 'percent' && (value < 1 || value > 100)
  end

  def available?
    return false unless active
    return false if expires_at && expires_at < Time.now
    return false if max_uses && used_count >= max_uses
    true
  end

  # Returns discount in paise. value is: percent (1-100) or flat rupees.
  def discount_amount_paise(subtotal_paise)
    if discount_type == 'percent'
      (subtotal_paise * value / 100.0).round
    else
      [value * 100, subtotal_paise].min
    end
  end

  def to_pos
    {
      id:               id,
      code:             code,
      discount_type:    discount_type,
      value:            value,
      min_order_amount: min_order_amount,
      max_uses:         max_uses,
      used_count:       used_count,
      expires_at:       expires_at,
      description:      description,
      active:           active,
      created_at:       created_at,
      updated_at:       updated_at
    }
  end
end

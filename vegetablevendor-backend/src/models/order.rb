class App::Models::Order < Sequel::Model
  ORDER_STATUSES = %w[placed packed out_for_delivery delivered cancelled].freeze

  many_to_one :user
  many_to_one :address
  one_to_many :order_items

  def validate
    super
    validates_presence [:user_id, :address_id, :total_amount]
    validates_includes ORDER_STATUSES, :status
  end

  def delivery_date
    base = created_at || Time.now
    # next-day delivery if ordered before noon, else 2 days
    if base.hour < 12
      (base + 1 * 86400).strftime('%Y-%m-%d')
    else
      (base + 2 * 86400).strftime('%Y-%m-%d')
    end
  end

  def delivery_window
    "#{delivery_date}, 7 AM – 12 PM"
  end

  def to_pos
    {
      id:              id,
      user_id:         user_id,
      address_id:      address_id,
      subtotal_amount: subtotal_amount || total_amount,
      delivery_fee:    delivery_fee || 0,
      discount_amount: discount_amount || 0,
      coupon_code:     coupon_code,
      total_amount:    total_amount,
      status:            status,
      payment_method:    payment_method,
      payment_status:    payment_status || 'pending',
      payment_reference: payment_reference,
      notes:             notes,
      delivery_date:   delivery_date,
      delivery_window: delivery_window,
      created_at:      created_at,
      updated_at:      updated_at,
      customer_name:   user&.full_name,
      customer_email:  user&.email,
      customer_phone:  user&.phone_number,
      address: address&.to_pos,
      items: (associations.key?(:order_items) ? order_items : order_items_dataset.eager(:product).all).map(&:to_pos)
    }
  end
end

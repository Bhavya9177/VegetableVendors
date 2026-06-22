class App::Models::Setting < Sequel::Model
  DEFAULTS = {
    'store_name'            => 'VegFresh',
    'store_tagline'         => 'Fresh from Farm to Your Door',
    'store_phone'           => '',
    'store_email'           => '',
    'store_address'         => '',
    'currency'              => 'INR',
    'tax_rate'              => '5',
    'notify_new_orders'     => 'true',
    'notify_low_stock'      => 'true',
    'delivery_fee'          => '40',
    'min_order_amount'      => '100',
    'free_delivery_above'   => '500',
    'same_day_cutoff'       => '14:00',
    'enable_delivery_slots' => 'true',
    'whatsapp_enabled'      => 'true',
    'maintenance_mode'      => 'false'
  }.freeze

  def self.get(key, default = nil)
    row = where(key: key.to_s).first
    return row.value if row
    default.nil? ? DEFAULTS[key.to_s] : default
  end

  def self.get_int(key, default = 0)
    get(key, default.to_s).to_i
  end

  def self.set(key, value)
    existing = where(key: key.to_s).first
    if existing
      existing.update(value: value.to_s, updated_at: Time.now)
    else
      create(key: key.to_s, value: value.to_s)
    end
  end

  # Merges DB values over defaults so un-set keys still return a value.
  def self.all_as_hash
    db_values = all.each_with_object({}) { |row, h| h[row.key] = row.value }
    DEFAULTS.merge(db_values)
  end
end

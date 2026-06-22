Sequel.migration do
  up do
    create_table(:coupons) do
      primary_key :id
      String    :code,             null: false, size: 50
      String    :discount_type,    null: false, size: 10   # 'percent' or 'flat'
      Integer   :value,            null: false              # percent: 1-100, flat: rupees
      Integer   :min_order_amount, null: false, default: 0 # rupees
      Integer   :max_uses,         null: true               # nil = unlimited
      Integer   :used_count,       null: false, default: 0
      DateTime  :expires_at,       null: true
      String    :description,      null: true, text: true
      TrueClass :active,           null: false, default: true
      DateTime  :created_at,       default: Sequel::CURRENT_TIMESTAMP
      DateTime  :updated_at,       default: Sequel::CURRENT_TIMESTAMP

      index :code, unique: true
    end
  end

  down do
    drop_table(:coupons)
  end
end

Sequel.migration do
  change do
    create_table(:order_items) do
      primary_key :id
      foreign_key :order_id, :orders, null: false, on_delete: :cascade
      foreign_key :product_id, :products, null: false
      Integer :quantity, null: false, default: 1
      Integer :unit_price, null: false, default: 0   # price snapshot at time of order (paise)
      String :unit, null: false, size: 20
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP

      index :order_id
      index :product_id
    end
  end
end

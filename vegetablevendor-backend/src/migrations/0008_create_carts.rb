Sequel.migration do
  change do
    create_table(:carts) do
      primary_key :id
      foreign_key :user_id, :users, null: false
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index :user_id, unique: true
    end

    create_table(:cart_items) do
      primary_key :id
      foreign_key :cart_id, :carts, null: false, on_delete: :cascade
      foreign_key :product_id, :products, null: false
      Integer :quantity, null: false, default: 1
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index [:cart_id, :product_id], unique: true
    end
  end
end

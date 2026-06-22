Sequel.migration do
  change do
    create_table(:reviews) do
      primary_key :id
      foreign_key :user_id,    :users,    null: false, on_delete: :cascade
      foreign_key :product_id, :products, null: false, on_delete: :cascade
      Integer     :rating,  null: false           # 1–5
      String      :comment, text: true
      TrueClass   :active,  default: true
      Integer     :created_by
      Integer     :updated_by
      DateTime    :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime    :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index [:user_id, :product_id], unique: true   # one review per product per user
      index :product_id
      index :active
    end
  end
end

Sequel.migration do
  up do
    run "CREATE TYPE order_status AS ENUM ('placed','packed','out_for_delivery','delivered','cancelled')"

    create_table(:orders) do
      primary_key :id
      foreign_key :user_id, :users, null: false
      foreign_key :address_id, :addresses, null: false
      Integer :total_amount, null: false, default: 0   # paise
      column :status, :order_status, null: false, default: 'placed'
      String :payment_method, null: false, default: 'cod', size: 20
      String :notes, text: true
      Integer :created_by
      Integer :updated_by
      DateTime :created_at, default: Sequel::CURRENT_TIMESTAMP
      DateTime :updated_at, default: Sequel::CURRENT_TIMESTAMP

      index :user_id
      index :status
    end
  end

  down do
    drop_table(:orders)
    run "DROP TYPE order_status"
  end
end

Sequel.migration do
  up do
    # users.email — full table scan on every login (WHERE email = ?)
    add_index :users, :email

    # users.active — filtered for customer count in dashboard
    add_index :users, :active

    # orders.payment_status — dashboard expected_cash query + payment flow filters
    add_index :orders, :payment_status

    # orders.payment_method — COD pending queries in dashboard and deliveries
    add_index :orders, :payment_method

    # composite: today's dashboard stats (WHERE status = X AND created_at >= today)
    add_index :orders, [:status, :created_at]
  end

  down do
    drop_index :users, :email
    drop_index :users, :active
    drop_index :orders, :payment_status
    drop_index :orders, :payment_method
    drop_index :orders, [:status, :created_at]
  end
end

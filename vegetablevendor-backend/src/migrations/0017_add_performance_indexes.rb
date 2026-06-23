Sequel.migration do
  up do
    # contact_messages had no indexes at all — ordered and filtered on every admin load
    add_index :contact_messages, :created_at
    add_index :contact_messages, :read
    add_index :contact_messages, [:read, :created_at]

    # orders ordered by created_at on every admin list / dashboard
    add_index :orders, :created_at

    # products ordered by created_at on every admin/public list
    add_index :products, :created_at

    # reviews ordered by created_at on admin list and dashboard
    add_index :reviews, :created_at

    # coupons ordered by created_at; active filtered during validation
    add_index :coupons, :created_at
    add_index :coupons, :active
  end

  down do
    drop_index :contact_messages, :created_at
    drop_index :contact_messages, :read
    drop_index :contact_messages, [:read, :created_at]
    drop_index :orders, :created_at
    drop_index :products, :created_at
    drop_index :reviews, :created_at
    drop_index :coupons, :created_at
    drop_index :coupons, :active
  end
end

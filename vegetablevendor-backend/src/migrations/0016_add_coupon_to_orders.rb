Sequel.migration do
  up do
    alter_table(:orders) do
      add_column :coupon_code,     String,  null: true,  size: 50
      add_column :discount_amount, Integer, null: false, default: 0
      add_column :delivery_fee,    Integer, null: false, default: 0
      add_column :subtotal_amount, Integer, null: true
    end
  end

  down do
    alter_table(:orders) do
      drop_column :coupon_code
      drop_column :discount_amount
      drop_column :delivery_fee
      drop_column :subtotal_amount
    end
  end
end

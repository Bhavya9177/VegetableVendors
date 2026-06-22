Sequel.migration do
  up do
    alter_table(:products) do
      add_column :low_stock_threshold, Integer, default: 10
      add_column :is_out_of_stock, TrueClass, default: false
    end
    run "UPDATE products SET is_out_of_stock = true  WHERE stock <= 0"
    run "UPDATE products SET is_out_of_stock = false WHERE stock > 0"
  end

  down do
    alter_table(:products) do
      drop_column :low_stock_threshold
      drop_column :is_out_of_stock
    end
  end
end

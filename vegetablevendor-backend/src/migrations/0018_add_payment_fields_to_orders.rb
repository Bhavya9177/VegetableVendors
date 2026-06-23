Sequel.migration do
  up do
    alter_table(:orders) do
      add_column :payment_status,    String, null: false, default: 'pending', size: 20
      add_column :payment_reference, String, null: true,  size: 100
    end
  end

  down do
    alter_table(:orders) do
      drop_column :payment_status
      drop_column :payment_reference
    end
  end
end

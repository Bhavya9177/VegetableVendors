Sequel.migration do
  up do
    alter_table(:products) do
      add_column :last_refill_alert_at, DateTime
    end
  end

  down do
    alter_table(:products) do
      drop_column :last_refill_alert_at
    end
  end
end

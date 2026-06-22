Sequel.migration do
  up do
    create_table(:refill_logs) do
      primary_key :id
      Integer  :product_id,               null: false
      String   :product_name,             null: false
      Integer  :current_stock,            null: false, default: 0
      Float    :avg_daily_demand,         default: 0.0
      Float    :forecasted_daily_demand,  default: 0.0
      Float    :days_of_stock_remaining   # NULL means infinite (nonzero stock, zero demand)
      Integer  :suggested_refill_qty,     default: 0
      String   :alert_level,              null: false   # 'critical' | 'warning'
      String   :notification_channel,     default: 'whatsapp'
      DateTime :created_at,               default: Sequel::CURRENT_TIMESTAMP

      index :product_id
      index :created_at
    end
  end

  down do
    drop_table(:refill_logs)
  end
end

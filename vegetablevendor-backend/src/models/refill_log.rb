class App::Models::RefillLog < Sequel::Model(:refill_logs)
  def to_pos
    {
      id:                      id,
      product_id:              product_id,
      product_name:            product_name,
      current_stock:           current_stock,
      avg_daily_demand:        avg_daily_demand,
      forecasted_daily_demand: forecasted_daily_demand,
      days_of_stock_remaining: days_of_stock_remaining,
      suggested_refill_qty:    suggested_refill_qty,
      alert_level:             alert_level,
      notification_channel:    notification_channel,
      created_at:              created_at
    }
  end
end

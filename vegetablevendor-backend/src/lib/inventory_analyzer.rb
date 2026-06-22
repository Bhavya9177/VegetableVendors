module App
  module InventoryAnalyzer
    # How far back to look for average demand
    ANALYSIS_WINDOW_DAYS = 30
    # Shorter window used to detect demand trends
    TREND_WINDOW_DAYS    = 7
    # Target buffer when calculating suggested refill quantity
    SAFETY_STOCK_DAYS    = 14
    # At or below this many days of stock → critical alert
    CRITICAL_DAYS_THRESHOLD = 3
    # At or below this many days of stock → warning alert
    WARNING_DAYS_THRESHOLD  = 7
    # Caps the trend multiplier so one unusual week can't spike the forecast 10×
    MAX_TREND_MULTIPLIER = 3.0
    # Minimum multiplier — prevents a slow week from eliminating the forecast
    MIN_TREND_MULTIPLIER = 0.5
    # Don't re-alert the same product within this many seconds
    ALERT_COOLDOWN_SECONDS = 12 * 3600

    # ── Public Interface ───────────────────────────────────────────────────

    # Returns demand-forecast data for every active product. No side-effects.
    def self.analyze_all
      products = App::Models::Product.where(active: true).all
      return [] if products.empty?

      product_ids = products.map(&:id)
      demand_30, demand_7 = batch_demand(product_ids)

      products.map { |p| build_analysis(p, demand_30[p.id].to_f, demand_7[p.id].to_f) }
              .sort_by { |a| [LEVEL_ORDER[a[:alert_level]], a[:days_of_stock_remaining] || 9999] }
    end

    # Admin-triggered check: sends WhatsApp alert for every critical/warning product
    # regardless of cooldown, then writes refill_log rows.
    # Returns a summary hash: { alerts_sent:, critical:, warning: }
    def self.run_refill_check
      products = App::Models::Product.where(active: true).all
      return { alerts_sent: 0, critical: 0, warning: 0 } if products.empty?

      product_ids = products.map(&:id)
      demand_30, demand_7 = batch_demand(product_ids)
      now = Time.now.utc

      critical_items = []
      warning_items  = []

      products.each do |p|
        analysis = build_analysis(p, demand_30[p.id].to_f, demand_7[p.id].to_f)
        next if analysis[:alert_level] == 'normal'

        if analysis[:alert_level] == 'critical'
          critical_items << analysis
        else
          warning_items << analysis
        end
      end

      to_notify = critical_items + warning_items
      return { alerts_sent: 0, critical: 0, warning: 0 } if to_notify.empty?

      whatsapp_error = nil
      begin
        App::WhatsApp.low_stock_alert(critical_items, warning_items)
      rescue => e
        whatsapp_error = e.message
        App.logger.error("WhatsApp low_stock_alert failed: #{e.message}")
      end

      persist_logs(to_notify)
      update_product_alert_timestamps(to_notify.map { |a| a[:product_id] }, now)

      { alerts_sent: to_notify.size, critical: critical_items.size, warning: warning_items.size, whatsapp_error: whatsapp_error }
    end

    # Sends an immediate WhatsApp alert for a single product that just went out of stock.
    # Bypasses the cooldown — call this directly when stock hits 0.
    def self.immediate_out_of_stock_alert(product)
      return unless product.stock.to_i <= 0

      demand_30, demand_7 = batch_demand([product.id])
      analysis = build_analysis(product, demand_30[product.id].to_f, demand_7[product.id].to_f)

      App::WhatsApp.low_stock_alert([analysis], [])
      persist_logs([analysis])
      update_product_alert_timestamps([product.id], Time.now.utc)
    rescue => e
      App.logger.error("immediate_out_of_stock_alert failed for #{product.name}: #{e.message}")
    end

    # Automatically refills a product that just hit zero stock.
    # Uses the demand-forecast suggested quantity (minimum 20 units).
    # Sends a WhatsApp restock notification automatically — no admin action needed.
    def self.auto_refill!(product)
      demand_30, demand_7 = batch_demand([product.id])
      analysis   = build_analysis(product, demand_30[product.id].to_f, demand_7[product.id].to_f)
      refill_qty = [analysis[:suggested_refill_qty], 20].max

      new_stock = product.stock.to_i + refill_qty
      product.update(stock: new_stock, is_out_of_stock: false)
      product.reload

      App.logger.info("Auto-refill: #{product.name} +#{refill_qty} #{product.unit} → #{new_stock} (demand-based)")

      begin
        App::WhatsApp.restock_alert(product, refill_qty, new_stock)
      rescue => e
        App.logger.error("Auto-refill WhatsApp alert failed for #{product.name}: #{e.message}")
      end

      persist_logs([analysis.merge(alert_level: 'critical')])
      update_product_alert_timestamps([product.id], Time.now.utc)
    rescue => e
      App.logger.error("auto_refill! failed for #{product.name}: #{e.message}")
    end

    # Lightweight post-order check for only the products whose stock just changed.
    # Sends alerts for any that are now low/out and haven't been alerted recently.
    # Out-of-stock products use a 1-hour cooldown; low-stock uses the full 12-hour cooldown.
    def self.quick_stock_check(product_ids)
      return if product_ids.empty?

      products = App::Models::Product.where(id: product_ids, active: true).all
      return if products.empty?

      ids       = products.map(&:id)
      demand_30, demand_7 = batch_demand(ids)
      now       = Time.now.utc
      last_map  = last_alert_times(ids)

      critical_items = []
      warning_items  = []

      products.each do |p|
        analysis = build_analysis(p, demand_30[p.id].to_f, demand_7[p.id].to_f)
        next if analysis[:alert_level] == 'normal'

        last_sent = last_map[p.id]
        # Out-of-stock: re-alert after 1 hour. Low stock: use full 12-hour cooldown.
        cooldown = p.stock.to_i <= 0 ? 3600 : ALERT_COOLDOWN_SECONDS
        next if last_sent && (now - last_sent) < cooldown

        if analysis[:alert_level] == 'critical'
          critical_items << analysis
        else
          warning_items << analysis
        end
      end

      to_notify = critical_items + warning_items
      return if to_notify.empty?

      begin
        App::WhatsApp.low_stock_alert(critical_items, warning_items)
      rescue => e
        App.logger.error("WhatsApp quick_stock_check failed: #{e.message}")
      end

      persist_logs(to_notify)
      update_product_alert_timestamps(to_notify.map { |a| a[:product_id] }, now)
    end

    # ── Private Helpers ────────────────────────────────────────────────────

    LEVEL_ORDER = { 'critical' => 0, 'warning' => 1, 'normal' => 2 }.freeze
    private_constant :LEVEL_ORDER

    def self.build_analysis(product, total_30, total_7)
      avg_daily    = total_30 / ANALYSIS_WINDOW_DAYS
      recent_daily = total_7  / TREND_WINDOW_DAYS

      trend_factor =
        if avg_daily > 0
          [[recent_daily / avg_daily, MAX_TREND_MULTIPLIER].min, MIN_TREND_MULTIPLIER].max
        else
          1.0
        end

      forecasted_daily = (avg_daily * trend_factor).round(2)

      days_remaining =
        if forecasted_daily > 0
          (product.stock.to_f / forecasted_daily).round(1)
        else
          product.stock > 0 ? nil : 0.0  # nil = infinite days (no demand)
        end

      # Target: SAFETY_STOCK_DAYS of forecasted demand, minimum low_stock_threshold × 5
      threshold    = (product.low_stock_threshold || 10).to_i
      target_stock = [
        (SAFETY_STOCK_DAYS * [forecasted_daily, avg_daily, 0.1].max).ceil,
        threshold * 5
      ].max
      suggested_refill = [target_stock - product.stock, 0].max

      alert_level =
        if product.is_out_of_stock || product.stock <= 0
          'critical'
        elsif days_remaining && days_remaining <= CRITICAL_DAYS_THRESHOLD
          'critical'
        elsif days_remaining && days_remaining <= WARNING_DAYS_THRESHOLD
          'warning'
        elsif product.low_stock?
          'warning'
        else
          'normal'
        end

      {
        product_id:              product.id,
        product_name:            product.name,
        unit:                    product.unit,
        current_stock:           product.stock,
        avg_daily_demand:        avg_daily.round(2),
        recent_daily_demand:     recent_daily.round(2),
        forecasted_daily_demand: forecasted_daily,
        trend_factor:            trend_factor.round(2),
        days_of_stock_remaining: days_remaining,
        suggested_refill_qty:    suggested_refill,
        alert_level:             alert_level,
        low_stock_threshold:     threshold,
        is_out_of_stock:         product.is_out_of_stock || false,
        image_url:               product.image_url
      }
    end

    # Returns [demand_30_map, demand_7_map] — both are { product_id => Float }
    def self.batch_demand(product_ids)
      now          = Time.now.utc
      window_30    = now - (ANALYSIS_WINDOW_DAYS * 86400)
      window_7     = now - (TREND_WINDOW_DAYS    * 86400)

      orders_30_ids = App.db[:orders]
        .exclude(status: 'cancelled')
        .where { created_at >= window_30 }
        .select(:id)

      orders_7_ids = App.db[:orders]
        .exclude(status: 'cancelled')
        .where { created_at >= window_7 }
        .select(:id)

      build_demand_map = lambda do |order_ids_ds|
        App.db[:order_items]
          .where(product_id: product_ids, order_id: order_ids_ds)
          .group(:product_id)
          .select(:product_id, Sequel.function(:sum, :quantity).as(:total_qty))
          .all
          .each_with_object({}) { |row, h| h[row[:product_id]] = row[:total_qty].to_f }
      end

      [build_demand_map.call(orders_30_ids), build_demand_map.call(orders_7_ids)]
    end

    # Returns { product_id => Time } for the most recent refill alert per product
    def self.last_alert_times(product_ids)
      App.db[:refill_logs]
        .where(product_id: product_ids)
        .group(:product_id)
        .select(:product_id, Sequel.function(:max, :created_at).as(:last_at))
        .all
        .each_with_object({}) { |row, h| h[row[:product_id]] = row[:last_at].to_time }
    rescue => e
      App.logger.warn("last_alert_times failed (table may not exist yet): #{e.message}")
      {}
    end

    def self.persist_logs(analyses)
      analyses.each do |a|
        App::Models::RefillLog.create(
          product_id:              a[:product_id],
          product_name:            a[:product_name],
          current_stock:           a[:current_stock],
          avg_daily_demand:        a[:avg_daily_demand],
          forecasted_daily_demand: a[:forecasted_daily_demand],
          days_of_stock_remaining: a[:days_of_stock_remaining],
          suggested_refill_qty:    a[:suggested_refill_qty],
          alert_level:             a[:alert_level],
          notification_channel:    'whatsapp'
        )
      end
    rescue => e
      App.logger.error("refill_log persist failed: #{e.message}")
    end

    def self.update_product_alert_timestamps(product_ids, now)
      return unless App::Models::Product.columns.include?(:last_refill_alert_at)
      App::Models::Product.where(id: product_ids).update(last_refill_alert_at: now)
    rescue => e
      App.logger.warn("update_product_alert_timestamps failed: #{e.message}")
    end

    private_class_method :build_analysis, :batch_demand, :last_alert_times,
                         :persist_logs, :update_product_alert_timestamps
  end
end

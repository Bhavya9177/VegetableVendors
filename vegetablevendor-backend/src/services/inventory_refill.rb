class App::Services::InventoryRefill < App::Services::Base
  # GET /api/admin/inventory/analysis
  # Returns demand forecast for every active product — no side-effects.
  def analysis
    results = App::InventoryAnalyzer.analyze_all
    return_success(results)
  end

  # POST /api/admin/inventory/analysis
  # Runs analysis, sends WhatsApp alerts for eligible products, writes logs.
  def run_check
    result = App::InventoryAnalyzer.run_refill_check
    msg =
      if result[:alerts_sent] == 0
        'No critical or warning products found — all stock levels are healthy.'
      elsif result[:whatsapp_error]
        "Found #{result[:alerts_sent]} item(s) needing restock but WhatsApp failed: #{result[:whatsapp_error]}"
      else
        "WhatsApp alert sent — #{result[:critical]} critical, #{result[:warning]} warning product(s) notified."
      end
    return_success(result.merge(message: msg))
  end

  # POST /api/admin/inventory/refill/:id
  # Adds stock quantity to a product and sends a WhatsApp restock alert to admin.
  def refill_product
    product = Product[rp[:id].to_i]
    return return_errors!('Product not found', 404) unless product

    qty = params[:qty].to_i
    return return_errors!('Quantity must be at least 1', 422) if qty < 1

    old_stock = product.stock.to_i
    new_stock = old_stock + qty

    product.update(stock: new_stock, is_out_of_stock: false)

    whatsapp_error = nil
    begin
      App::WhatsApp.restock_alert(product, qty, new_stock)
    rescue => e
      whatsapp_error = e.message
      App.logger.error("WhatsApp restock_alert failed: #{e.message}")
    end

    # Run a post-refill check to clear stale alerts
    App::InventoryAnalyzer.quick_stock_check([product.id]) rescue nil

    msg = whatsapp_error \
      ? "#{product.name} restocked (+#{qty} #{product.unit}). WhatsApp alert failed: #{whatsapp_error}" \
      : "#{product.name} restocked with +#{qty} #{product.unit}. WhatsApp alert sent to admin."

    return_success(product.reload.to_pos, message: msg, whatsapp_error: whatsapp_error)
  end

  # GET /api/admin/inventory/refill-logs
  # Paginated history of all refill alerts that have been sent.
  def logs
    ds    = RefillLog.order(Sequel.desc(:created_at))
    count = ds.count
    rows  = ds.offset(offset).limit(limit).all.map(&:to_pos)
    return_success(rows, total: count, total_pages: (count / page_size.to_f).ceil)
  end
end

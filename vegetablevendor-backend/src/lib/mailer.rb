module App
  class Mailer
    def self.order_confirmation(order)
      return unless email_configured?

      to_email = order.user&.email
      return if to_email.to_s.strip.empty?

      name       = order.user&.full_name || 'Customer'
      body_html  = confirmation_html(order, name)
      from_addr  = from_address
      subject    = "Order Confirmed! ##{order.id} — VegFresh"

      mail = Mail.new do
        from    from_addr
        to      to_email
        subject subject
        html_part do
          content_type 'text/html; charset=UTF-8'
          body         body_html
        end
      end
      mail.deliver!
    rescue => e
      App.logger.error("Mailer.order_confirmation failed (order #{order.id}): #{e.message}")
    end

    def self.order_status_update(order)
      return unless email_configured?
      return if order.status == 'placed'  # handled by order_confirmation

      to_email = order.user&.email
      return if to_email.to_s.strip.empty?

      name       = order.user&.full_name || 'Customer'
      body_html  = status_html(order, name)
      from_addr  = from_address
      subject    = "Order Update: #{order.status.gsub('_', ' ').capitalize} — Order ##{order.id}"

      mail = Mail.new do
        from    from_addr
        to      to_email
        subject subject
        html_part do
          content_type 'text/html; charset=UTF-8'
          body         body_html
        end
      end
      mail.deliver!
    rescue => e
      App.logger.error("Mailer.order_status_update failed (order #{order.id}): #{e.message}")
    end

    def self.email_configured?
      ENV['EMAIL_USER'].to_s.present? &&
        ENV['EMAIL_PASSWORD'].to_s.present? &&
        ENV['EMAIL_SMTP_SERVER'].to_s.present?
    end

    private_class_method

    def self.from_address
      name = ENV.fetch('EMAIL_FROM_NAME', 'VegFresh')
      "#{name} <#{ENV['EMAIL_USER']}>"
    end

    def self.items_html(order)
      items = order.associations[:order_items] ||
              order.order_items_dataset.eager(:product).all
      items.map do |oi|
        product_name = oi.product&.name || 'Product'
        line_total   = (oi.unit_price.to_i * oi.quantity / 100.0).round(2)
        "<tr>
          <td style='padding:6px 4px'>#{product_name}</td>
          <td style='padding:6px 4px;text-align:center'>#{oi.quantity} #{oi.unit}</td>
          <td style='padding:6px 4px;text-align:right'>₹#{line_total}</td>
        </tr>"
      end.join
    end

    def self.confirmation_html(order, name)
      rows     = items_html(order)
      subtotal = order.subtotal_amount || order.total_amount
      discount = order.discount_amount.to_i
      fee      = order.delivery_fee.to_i
      total    = order.total_amount.to_i

      coupon_row = discount > 0 ? "<tr><td colspan='2' style='color:#16a34a'>Coupon (#{order.coupon_code})</td><td style='color:#16a34a;text-align:right'>-₹#{(discount / 100.0).round(2)}</td></tr>" : ''
      fee_row    = fee > 0 ? "<tr><td colspan='2'>Delivery Fee</td><td style='text-align:right'>₹#{(fee / 100.0).round(2)}</td></tr>" : "<tr><td colspan='2' style='color:#16a34a'>Delivery</td><td style='color:#16a34a;text-align:right'>FREE</td></tr>"

      <<~HTML
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px">
        <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
          <h1 style="color:#16a34a;margin:0 0 4px">Order Confirmed! 🎉</h1>
          <p style="color:#6b7280;margin:0 0 20px">Hi #{name}, your order is confirmed.</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead><tr style="background:#f0fdf4;border-bottom:1px solid #dcfce7">
              <th align="left" style="padding:8px 4px">Item</th>
              <th style="padding:8px 4px;text-align:center">Qty</th>
              <th style="padding:8px 4px;text-align:right">Price</th>
            </tr></thead>
            <tbody>#{rows}</tbody>
          </table>

          <table style="width:100%;border-top:1px solid #e5e7eb;margin-bottom:20px">
            <tr><td colspan='2'>Subtotal</td><td style='text-align:right'>₹#{(subtotal.to_i / 100.0).round(2)}</td></tr>
            #{coupon_row}
            #{fee_row}
            <tr style="font-weight:bold;font-size:16px"><td colspan='2'>Total</td><td style='text-align:right;color:#16a34a'>₹#{(total / 100.0).round(2)}</td></tr>
          </table>

          <p style="margin:0"><strong>Estimated delivery:</strong> #{order.delivery_window}</p>
          <p style="margin:8px 0 0;color:#6b7280;font-size:12px">Thank you for shopping with VegFresh!</p>
        </div>
        </body></html>
      HTML
    end

    def self.status_html(order, name)
      label = order.status.gsub('_', ' ').capitalize
      emoji = { 'packed' => '📦', 'out_for_delivery' => '🚚', 'delivered' => '✅', 'cancelled' => '❌' }[order.status] || '📋'

      <<~HTML
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px">
        <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
          <h1 style="color:#16a34a;margin:0 0 4px">Order Update #{emoji}</h1>
          <p style="color:#6b7280;margin:0 0 20px">Hi #{name},</p>
          <p>Your order <strong>##{order.id}</strong> status has been updated to: <strong>#{label}</strong>.</p>
          <p>Estimated delivery: #{order.delivery_window}</p>
          <p style="color:#6b7280;font-size:12px;margin-top:24px">Thank you for shopping with VegFresh!</p>
        </div>
        </body></html>
      HTML
    end
  end
end

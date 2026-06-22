require 'net/http'
require 'uri'
require 'json'

module App
  module WhatsApp
    API_VERSION = 'v19.0'

    # Token is stored here after an auto-refresh so it survives server restarts.
    # The file sits in the backend root directory and is gitignored.
    TOKEN_CACHE_FILE = File.expand_path('../../../.whatsapp_token', __FILE__)

    # ── Token helpers ──────────────────────────────────────────────────────────

    # Returns the best available token: cached refreshed token → .env fallback
    def self.access_token
      if File.exist?(TOKEN_CACHE_FILE)
        cached = File.read(TOKEN_CACHE_FILE).strip
        return cached if cached.length > 10
      end
      ENV['WHATSAPP_ACCESS_TOKEN']
    end

    def self.phone_number_id; ENV['WHATSAPP_PHONE_NUMBER_ID']; end
    def self.vendor_phone;    ENV['VENDOR_WHATSAPP_PHONE'];    end

    # Exchanges the current token for a long-lived 60-day token via Meta's API.
    # Requires WHATSAPP_APP_ID and WHATSAPP_APP_SECRET to be set in .env.
    # Returns the new token string, or nil on failure.
    def self.refresh_token!
      app_id     = ENV['WHATSAPP_APP_ID']
      app_secret = ENV['WHATSAPP_APP_SECRET']

      unless app_id.present? && app_secret.present?
        App.logger.warn('WhatsApp: cannot auto-refresh — WHATSAPP_APP_ID / WHATSAPP_APP_SECRET not set in .env')
        return nil
      end

      # Use the .env token for the exchange, not the potentially-stale cache file
      current = ENV['WHATSAPP_ACCESS_TOKEN']
      unless current.present?
        App.logger.warn('WhatsApp: cannot refresh — WHATSAPP_ACCESS_TOKEN not set in .env')
        return nil
      end

      uri = URI('https://graph.facebook.com/oauth/access_token')
      uri.query = URI.encode_www_form(
        grant_type:        'fb_exchange_token',
        client_id:         app_id,
        client_secret:     app_secret,
        fb_exchange_token: current
      )

      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl      = true
      http.read_timeout = 15
      res    = http.get(uri.request_uri)
      parsed = JSON.parse(res.body) rescue {}

      new_token = parsed['access_token']
      if new_token.present?
        File.write(TOKEN_CACHE_FILE, new_token)
        App.logger.info('WhatsApp: token auto-refreshed and saved (long-lived ~60 days)')
        new_token
      else
        err = parsed.dig('error', 'message') || res.body
        App.logger.error("WhatsApp: token refresh failed — #{err}")
        nil
      end
    rescue => e
      App.logger.error("WhatsApp: refresh_token! exception — #{e.message}")
      nil
    end

    # Returns status info for the admin UI.
    def self.token_status
      has_env_token    = ENV['WHATSAPP_ACCESS_TOKEN'].present?
      has_cached_token = File.exist?(TOKEN_CACHE_FILE) && File.read(TOKEN_CACHE_FILE).strip.length > 10
      can_auto_refresh = ENV['WHATSAPP_APP_ID'].present? && ENV['WHATSAPP_APP_SECRET'].present?
      {
        configured:       has_env_token || has_cached_token,
        has_env_token:    has_env_token,
        has_cached_token: has_cached_token,
        can_auto_refresh: can_auto_refresh,
        vendor_phone:     vendor_phone,
        phone_number_id:  phone_number_id.present?,
      }
    end

    # ── Public Message Interface ───────────────────────────────────────────────

    STATUS_LABELS = {
      'placed'           => 'Order Placed',
      'packed'           => 'Packed',
      'out_for_delivery' => 'Out for Delivery',
      'delivered'        => 'Delivered',
      'cancelled'        => 'Cancelled',
    }.freeze

    STATUS_MESSAGES = {
      'packed'           => '📦 Your order is being packed and will be dispatched soon.',
      'out_for_delivery' => '🚴 Your order is out for delivery! Expect it within the hour.',
      'delivered'        => '✅ Your order has been delivered. Enjoy your fresh produce!',
      'cancelled'        => '❌ Your order has been cancelled. Contact us if you need help.',
    }.freeze

    def self.order_confirmation(order)
      user  = order.user
      items = order.order_items_dataset.all

      items_text = items.map do |item|
        "• #{item.product&.name} x#{item.quantity} (#{item.unit}) — ₹#{fmt(item.unit_price * item.quantity)}"
      end.join("\n")

      addr      = order.address
      addr_text = addr ? "#{addr.line1}, #{addr.city} — #{addr.pincode}" : 'your delivery address'

      customer_msg = <<~MSG
        🛒 Order Confirmed — VegFresh ✅

        Hi #{user&.full_name}! Your order ##{order.id} is confirmed.

        Items ordered:
        #{items_text}

        💰 Total: ₹#{fmt(order.total_amount)}
        💵 Payment: Cash on Delivery
        📍 Delivery to: #{addr_text}

        🕐 Estimated delivery: #{order.delivery_window}

        Thank you for choosing VegFresh! 🥦🍅
      MSG

      send_message(to: user&.phone_number, body: customer_msg.strip)

      vendor_msg = <<~MSG
        🆕 New Order — VegFresh

        Order ##{order.id} placed by #{user&.full_name} (#{user&.phone_number})

        Items:
        #{items_text}

        💰 Total: ₹#{fmt(order.total_amount)} (COD)
        📍 #{addr_text}
      MSG

      send_message(to: vendor_phone, body: vendor_msg.strip)
    end

    def self.order_status_update(order)
      user = order.user
      msg  = STATUS_MESSAGES[order.status]
      return unless msg

      label = STATUS_LABELS[order.status] || order.status

      body = <<~MSG
        📬 VegFresh Order Update

        Order ##{order.id} → #{label}

        #{msg}

        Thank you for choosing VegFresh! 🌿
      MSG

      send_message(to: user&.phone_number, body: body.strip)
    end

    def self.low_stock_alert(critical_items, warning_items)
      raise 'VENDOR_WHATSAPP_PHONE is not configured in .env' unless vendor_phone.present?

      out_of_stock   = critical_items.select { |i| i[:current_stock] <= 0 }
      critically_low = critical_items.reject { |i| i[:current_stock] <= 0 }

      lines = []
      total = out_of_stock.size + critically_low.size + warning_items.size

      if out_of_stock.any?
        lines << "❌ OUT OF STOCK (#{out_of_stock.size} item#{out_of_stock.size > 1 ? 's' : ''}):"
        out_of_stock.each_with_index do |item, i|
          lines << "#{i + 1}. #{item[:product_name]} — 0 #{item[:unit]} remaining"
          lines << "   Suggested restock: #{item[:suggested_refill_qty]} #{item[:unit]}"
        end
        lines << ""
      end

      if critically_low.any?
        lines << "🚨 CRITICALLY LOW (#{critically_low.size} item#{critically_low.size > 1 ? 's' : ''}):"
        critically_low.each_with_index do |item, i|
          days_txt = item[:days_of_stock_remaining] ? "~#{item[:days_of_stock_remaining]}d left" : "very low"
          lines << "#{i + 1}. #{item[:product_name]} — #{item[:current_stock]} #{item[:unit]} (#{days_txt})"
          lines << "   Suggested restock: #{item[:suggested_refill_qty]} #{item[:unit]}"
        end
        lines << ""
      end

      if warning_items.any?
        lines << "⚠️ LOW STOCK (#{warning_items.size} item#{warning_items.size > 1 ? 's' : ''}):"
        warning_items.each_with_index do |item, i|
          days_txt = item[:days_of_stock_remaining] ? "~#{item[:days_of_stock_remaining]}d left" : "running low"
          lines << "#{i + 1}. #{item[:product_name]} — #{item[:current_stock]} #{item[:unit]} (#{days_txt})"
          lines << "   Suggested restock: #{item[:suggested_refill_qty]} #{item[:unit]}"
        end
      end

      body = <<~MSG
        🌿 VegFresh — Stock Alert (#{total} item#{total > 1 ? 's' : ''} need attention)

        #{lines.join("\n")}

        Please restock immediately to avoid order issues.
        Go to: VegFresh Admin → Inventory
      MSG

      send_message(to: vendor_phone, body: body.strip, required: true)
    end

    def self.restock_alert(product, qty_added, new_stock)
      return unless vendor_phone.present?

      body = <<~MSG
        ✅ VegFresh — Stock Refilled

        Product: #{product.name}
        Quantity Added: +#{qty_added} #{product.unit}
        New Stock Level: #{new_stock} #{product.unit}

        Stock has been replenished via Admin Panel.
        Go to: VegFresh Admin → Inventory
      MSG

      send_message(to: vendor_phone, body: body.strip, required: true)
    end

    # ── Core sender with auto-refresh on 401 ─────────────────────────────────

    def self.send_message(to:, body:, required: false)
      phone = normalize_phone(to)
      unless phone
        raise "WhatsApp: invalid or missing phone number '#{to}'" if required
        App.logger.warn("WhatsApp: skipping — invalid/missing phone '#{to}'")
        return
      end

      unless access_token.present?
        raise 'WhatsApp access token is not configured. Set WHATSAPP_ACCESS_TOKEN in .env'
      end

      unless phone_number_id.present? && phone_number_id != 'FILL_IN_FROM_META_BUSINESS_MANAGER'
        raise 'WhatsApp Phone Number ID is not configured. Set WHATSAPP_PHONE_NUMBER_ID in .env'
      end

      do_send(phone: phone, body: body, token: access_token, attempt: 1)
    end

    # ── Private ────────────────────────────────────────────────────────────────

    def self.do_send(phone:, body:, token:, attempt:)
      uri  = URI("https://graph.facebook.com/#{API_VERSION}/#{phone_number_id}/messages")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl      = true
      http.read_timeout = 15

      req = Net::HTTP::Post.new(uri)
      req['Authorization'] = "Bearer #{token}"
      req['Content-Type']  = 'application/json'
      req.body = {
        messaging_product: 'whatsapp',
        recipient_type:    'individual',
        to:                phone,
        type:              'text',
        text:              { preview_url: false, body: body }
      }.to_json

      App.logger.info("WhatsApp → sending to #{phone} via phone_number_id=#{phone_number_id}")

      res    = http.request(req)
      parsed = JSON.parse(res.body) rescue {}

      App.logger.info("WhatsApp ← #{res.code}: #{res.body}")

      if res.code.to_i < 300
        msg_id = parsed.dig('messages', 0, 'id')
        raise "WhatsApp: message not accepted by Meta (no message_id in response) — body: #{res.body}" unless msg_id
        App.logger.info("WhatsApp ✓ → #{phone} (msg_id: #{msg_id})")

      elsif res.code.to_i == 401 && attempt == 1
        # Token expired — clear any stale cache, then try to auto-refresh with .env token
        App.logger.warn('WhatsApp: 401 received — clearing cache and attempting auto token refresh…')
        File.delete(TOKEN_CACHE_FILE) if File.exist?(TOKEN_CACHE_FILE)
        new_token = refresh_token!
        if new_token
          App.logger.info('WhatsApp: retrying with refreshed token…')
          do_send(phone: phone, body: body, token: new_token, attempt: 2)
        else
          app_id = ENV['WHATSAPP_APP_ID']
          raise "WhatsApp token expired. Get a new 24-hour token here:\n" \
                "  https://developers.facebook.com/apps/#{app_id}/whatsapp-business/wa-dev-console/\n" \
                "Paste it as WHATSAPP_ACCESS_TOKEN in .env, restart the server, " \
                "then click 'Refresh Token' in Admin → WhatsApp to extend it to 60 days."
        end

      else
        err_msg = parsed.dig('error', 'message') || res.body
        App.logger.error("WhatsApp ✗ #{res.code}: #{err_msg}")
        raise "WhatsApp API error #{res.code}: #{err_msg}"
      end
    rescue => e
      App.logger.error("WhatsApp error: #{e.class}: #{e.message}")
      raise
    end

    def self.normalize_phone(raw)
      return nil unless raw.present?
      digits = raw.to_s.gsub(/\D/, '')
      return digits        if digits.length == 12 && digits.start_with?('91')
      return "91#{digits}" if digits.length == 10
      return digits        if digits.length > 10
      nil
    end

    def self.fmt(paise)
      '%.2f' % (paise.to_f / 100)
    end

    private_class_method :fmt, :normalize_phone, :do_send
  end
end

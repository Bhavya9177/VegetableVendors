class App::Services::WhatsAppAdmin < App::Services::Base
  # GET /api/admin/whatsapp/token-status
  def token_status
    return_success(App::WhatsApp.token_status)
  end

  # POST /api/admin/whatsapp/refresh-token
  def refresh_token
    new_token = App::WhatsApp.refresh_token!
    if new_token
      return_success(
        App::WhatsApp.token_status,
        message: 'Token refreshed successfully! Your WhatsApp integration will now work for ~60 days.'
      )
    else
      return_errors!(
        'Token refresh failed. Make sure WHATSAPP_APP_ID and WHATSAPP_APP_SECRET are set in your .env file. ' \
        'Find them at: developers.facebook.com → your app → Settings → Basic.',
        422
      )
    end
  end

  # POST /api/admin/whatsapp/test-send
  def test_send
    phone      = ENV['VENDOR_WHATSAPP_PHONE']
    token      = App::WhatsApp.access_token
    phone_id   = ENV['WHATSAPP_PHONE_NUMBER_ID']

    return_errors!('VENDOR_WHATSAPP_PHONE is not set in .env', 422) if phone.blank?
    return_errors!('WHATSAPP_ACCESS_TOKEN is not set in .env', 422) if token.blank?
    return_errors!('WHATSAPP_PHONE_NUMBER_ID is not set in .env', 422) if phone_id.blank?

    digits = phone.to_s.gsub(/\D/, '')
    normalized = digits.length == 10 ? "91#{digits}" : digits

    App::WhatsApp.send_message(
      to:   phone,
      body: "✅ VegFresh WhatsApp Test\n\nThis is a test message to confirm your WhatsApp alerts are working correctly.\n\nIf you received this, alerts will be delivered automatically!"
    )

    return_success({
      sent_to:        normalized,
      phone_number_id: phone_id,
      token_prefix:   "#{token[0..6]}...",
      note:           'In sandbox mode, message comes FROM +1-555-672-8070. Check that number on WhatsApp.'
    }, message: "Test message sent to #{normalized}! Check WhatsApp — look for +1-555-672-8070.")
  rescue => e
    return_errors!("Send failed: #{e.message} | phone=#{ENV['VENDOR_WHATSAPP_PHONE']} phone_id=#{ENV['WHATSAPP_PHONE_NUMBER_ID']}", 422)
  end
end

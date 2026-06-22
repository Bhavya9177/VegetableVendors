require 'mail'

if ENV['EMAIL_SMTP_SERVER'].to_s.strip.length > 0
  # Strip spaces from App Passwords (Google shows them with spaces for readability)
  password = ENV['EMAIL_PASSWORD'].to_s.gsub(' ', '')

  options = {
    address:              ENV['EMAIL_SMTP_SERVER'],
    port:                 587,
    domain:               ENV['EMAIL_DOMAIN'],
    user_name:            ENV['EMAIL_USER'],
    password:             password,
    authentication:       'plain',
    enable_starttls_auto: true
  }

  Mail.defaults do
    delivery_method :smtp, options
  end
end

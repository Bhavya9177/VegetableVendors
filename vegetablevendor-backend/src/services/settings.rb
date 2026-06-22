class App::Services::Settings < App::Services::Base
  def model; Setting; end

  def show
    return_success(Setting.all_as_hash)
  end

  def update
    settings_data  = params || {}
    allowed_keys   = Setting::DEFAULTS.keys

    settings_data.each do |key, value|
      Setting.set(key.to_s, value.to_s) if allowed_keys.include?(key.to_s)
    end

    return_success(Setting.all_as_hash, message: 'Settings saved successfully')
  end

  def self.fields
    { save: [] }
  end
end

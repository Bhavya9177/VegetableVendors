require 'bcrypt'
class App::Models::User < Sequel::Model
  include BCrypt

  one_to_many :addresses
  one_to_many :orders
  one_to_one  :cart

  def validate
    super
    validates_presence [:full_name, :email]
    validates_unique(:email) { |ds| ds.where(active: true) }
  end

  def admin?
    role == 0
  end

  def password
    return nil if encoded_password.nil?
    @password ||= Password.new(encoded_password)
  end

  def password=(new_password)
    @password = Password.create(new_password)
    self.encoded_password = @password.to_s
  end

  def authenticate(plain)
    return false if encoded_password.nil?
    password == plain
  end

  def to_pos
    as_pos
  end

  def as_pos
    {
      id: id,
      full_name: full_name,
      email: email,
      role: role,
      phone_number: phone_number,
      active: active,
      created_at: created_at
    }
  end
end

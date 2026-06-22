class App::Models::Address < Sequel::Model
  many_to_one :user
  one_to_many :orders

  def validate
    super
    validates_presence [:user_id, :full_name, :phone, :line1, :city, :state, :pincode]
  end

  def to_pos
    {
      id: id,
      user_id: user_id,
      full_name: full_name,
      phone: phone,
      line1: line1,
      line2: line2,
      city: city,
      state: state,
      pincode: pincode,
      is_default: is_default,
      active: active
    }
  end
end

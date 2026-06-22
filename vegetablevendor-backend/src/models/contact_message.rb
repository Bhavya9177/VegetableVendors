class App::Models::ContactMessage < Sequel::Model
  def validate
    super
    validates_presence [:name, :email, :message]
    validates_format(/\A[^@\s]+@[^@\s]+\.[^@\s]+\z/, :email, message: 'is not a valid email')
    validates_max_length 500, :message
  end

  def to_pos
    {
      id:         id,
      name:       name,
      email:      email,
      subject:    subject,
      message:    message,
      read:       read || false,
      created_at: created_at
    }
  end
end

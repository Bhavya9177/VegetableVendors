class App::Models::Review < Sequel::Model
  many_to_one :user
  many_to_one :product

  def validate
    super
    validates_presence [:user_id, :product_id, :rating]
    validates_integer :rating
    validates_includes (1..5).to_a, :rating, message: 'must be between 1 and 5'
    validates_unique [:user_id, :product_id]
  end

  def to_pos
    {
      id: id,
      product_id: product_id,
      product_name: product&.name,
      user_id: user_id,
      user_name: user&.full_name,
      rating: rating,
      comment: comment,
      active: active,
      created_at: created_at
    }
  end
end

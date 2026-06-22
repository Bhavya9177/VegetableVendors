class App::Models::CartItem < Sequel::Model
  many_to_one :cart
  many_to_one :product

  def to_pos
    p = product
    {
      id: id,
      cart_id: cart_id,
      product_id: product_id,
      quantity: quantity,
      product_name: p&.name,
      product_image: p&.image_url,
      unit: p&.unit,
      unit_price: p&.price,
      subtotal: (p&.price || 0) * quantity
    }
  end
end

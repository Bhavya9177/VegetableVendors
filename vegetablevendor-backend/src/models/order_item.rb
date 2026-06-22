class App::Models::OrderItem < Sequel::Model
  many_to_one :order
  many_to_one :product

  def to_pos
    {
      id: id,
      order_id: order_id,
      product_id: product_id,
      quantity: quantity,
      unit_price: unit_price,
      unit: unit,
      product_name: product&.name,
      product_image: product&.image_url
    }
  end
end

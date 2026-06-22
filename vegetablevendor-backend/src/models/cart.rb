class App::Models::Cart < Sequel::Model
  many_to_one :user
  one_to_many :cart_items

  def to_pos
    items = cart_items_dataset.all.map(&:to_pos)
    {
      id: id,
      user_id: user_id,
      items: items,
      total: items.sum { |i| i[:subtotal] },
      item_count: items.sum { |i| i[:quantity] }
    }
  end
end

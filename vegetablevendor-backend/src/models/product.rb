class App::Models::Product < Sequel::Model
  many_to_one :category
  one_to_many :cart_items
  one_to_many :order_items
  one_to_many :reviews

  def validate
    super
    validates_presence [:name, :slug, :price, :unit, :category_id]
    validates_unique :slug
    validates_integer :price
    validates_operator(:>=, 0, :price, message: 'must be >= 0')
    validates_integer :stock
    validates_operator(:>=, 0, :stock, message: 'must be >= 0')
  end

  def low_stock?
    return false unless self.class.columns.include?(:low_stock_threshold) && self.class.columns.include?(:is_out_of_stock)
    !is_out_of_stock && stock > 0 && stock <= (low_stock_threshold || 10)
  end

  def rating_data
    @rating_data ||= begin
      ds  = reviews_dataset.where(active: true)
      cnt = ds.count
      avg = cnt > 0 ? ds.avg(:rating).to_f.round(1) : nil
      { average: avg, count: cnt }
    end
  end

  def to_pos(preloaded_rating = nil)
    rd = preloaded_rating || rating_data
    {
      id: id,
      name: name,
      slug: slug,
      description: description,
      price: price,
      unit: unit,
      stock: stock,
      low_stock_threshold: self.class.columns.include?(:low_stock_threshold) ? (low_stock_threshold || 10) : 10,
      is_out_of_stock: self.class.columns.include?(:is_out_of_stock) ? (is_out_of_stock || false) : false,
      low_stock: low_stock?,
      image_url: image_url,
      featured: featured,
      active: active,
      category_id: category_id,
      category_name: category&.name,
      average_rating: rd[:average],
      review_count: rd[:count],
      created_at: created_at,
      updated_at: updated_at
    }
  end
end

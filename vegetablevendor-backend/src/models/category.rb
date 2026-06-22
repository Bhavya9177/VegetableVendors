class App::Models::Category < Sequel::Model
  one_to_many :products

  def validate
    super
    validates_presence [:name, :slug]
    validates_unique :slug
  end

  def to_pos(product_count: nil)
    {
      id: id,
      name: name,
      slug: slug,
      description: description,
      image_url: image_url,
      active: active,
      created_at: created_at,
      product_count: product_count.nil? ? products_dataset.where(active: true).count : product_count
    }
  end
end

class App::Services::Categories < App::Services::Base
  def model; Category; end

  def list
    categories = model.where(active: true).order(:name).all
    counts = product_counts(categories.map(&:id))
    return_success(categories.map { |c| c.to_pos(product_count: counts[c.id] || 0) })
  end

  def admin_list
    ds = model.order(Sequel.desc(:created_at))
    ds = ds.where(Sequel.ilike(:name, "%#{qs[:search]}%")) if qs[:search].present?
    count = ds.count
    categories = ds.offset(offset).limit(limit).all
    counts = product_counts(categories.map(&:id))
    return_success(
      categories.map { |c| c.to_pos(product_count: counts[c.id] || 0) },
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  def create
    data = data_for(:save)
    data[:slug] = slugify(data[:name]) if data[:slug].blank? && data[:name].present?
    obj = model.new(data)
    save(obj)
  end

  def update
    data = data_for(:save)
    data[:slug] = slugify(data[:name]) if data[:slug].blank? && data[:name].present?
    item.set_fields(data, data.keys)
    save(item)
  end

  def self.fields
    {
      save: [:name, :slug, :description, :image_url, :active]
    }
  end

  private

  def product_counts(category_ids)
    return {} if category_ids.empty?
    App.db[:products]
      .where(category_id: category_ids, active: true)
      .group_and_count(:category_id)
      .each_with_object({}) { |row, h| h[row[:category_id]] = row[:count] }
  end

  def slugify(str)
    return '' if str.nil?
    str.downcase.strip.gsub(/[^a-z0-9\s-]/, '').gsub(/\s+/, '-')
  end
end

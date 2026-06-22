class App::Services::Products < App::Services::Base
  def model; Product; end

  def list
    ds = model.where(active: true)
    ds = ds.where(category_id: qs[:category_id].to_i) if qs[:category_id].present?
    ds = ds.where(featured: true) if qs[:featured] == 'true'
    if qs[:search].present?
      ds = ds.where(Sequel.ilike(:name, "%#{qs[:search]}%"))
    end
    ds = ds.where(Sequel[:price] >= qs[:min_price].to_i) if qs[:min_price].present?
    ds = ds.where(Sequel[:price] <= qs[:max_price].to_i) if qs[:max_price].present?

    count = ds.count
    return_success(
      ds.order(Sequel.desc(:created_at)).offset(offset).limit(limit).all.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  def admin_list
    ds = model.order(Sequel.desc(:created_at))
    ds = ds.where(Sequel.ilike(:name, "%#{qs[:search]}%")) if qs[:search].present?
    ds = ds.where(category_id: qs[:category_id].to_i) if qs[:category_id].present?
    count = ds.count
    return_success(
      ds.offset(offset).limit(limit).all.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  def get
    product = model[rp[:id]] || return_errors!('Product not found', 404)
    return_success(product.to_pos)
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

    was_in_stock = item.stock.to_i > 0
    item.set_fields(data, data.keys)
    result = save(item)

    # Auto-alert admin if product just went out of stock via admin stock edit
    if data.key?(:stock) && item.stock.to_i <= 0 && was_in_stock
      begin
        App::InventoryAnalyzer.immediate_out_of_stock_alert(item)
      rescue => e
        App.logger.error("Auto out-of-stock alert failed for #{item.name}: #{e.message}")
      end
    end

    result
  end

  def self.fields
    {
      save: [:category_id, :name, :slug, :description, :price, :unit, :stock,
             :low_stock_threshold, :is_out_of_stock, :image_url, :featured, :active]
    }
  end

  private

  def slugify(str)
    return '' if str.nil?
    str.downcase.strip.gsub(/[^a-z0-9\s-]/, '').gsub(/\s+/, '-')
  end
end

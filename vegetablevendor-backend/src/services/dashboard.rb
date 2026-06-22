class App::Services::Dashboard < App::Services::Base

  def index
    low_stock_products = Product
      .where(active: true, is_out_of_stock: false)
      .where { stock <= low_stock_threshold }
      .order(:stock)
      .limit(10)
      .all
      .map { |p| { id: p.id, name: p.name, stock: p.stock, unit: p.unit, threshold: p.low_stock_threshold || 10, image_url: p.image_url } }

    recent_reviews = Review
      .where(active: true)
      .order(Sequel.desc(:created_at))
      .limit(5)
      .all.map(&:to_pos)

    stats = {
      total_products:     Product.where(active: true).count,
      total_categories:   Category.where(active: true).count,
      total_orders:       Order.count,
      total_revenue:      Order.where(status: 'delivered').sum(:total_amount) || 0,
      pending_orders:     Order.where(status: 'placed').count,
      out_of_stock:       Product.where(active: true, is_out_of_stock: true).count,
      low_stock_count:    low_stock_products.size,
      low_stock_products: low_stock_products,
      recent_orders:      Order.order(Sequel.desc(:created_at)).limit(10).all.map(&:to_pos),
      orders_by_status:   Order::ORDER_STATUSES.map { |s| { status: s, count: Order.where(status: s).count } },
      recent_reviews:     recent_reviews,
    }
    return_success(stats)
  end
end

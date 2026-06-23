class App::Services::Dashboard < App::Services::Base

  def index
    low_stock_products = Product
      .where(active: true, is_out_of_stock: false)
      .where { stock <= low_stock_threshold }
      .order(:stock)
      .limit(10)
      .all
      .map { |p| { id: p.id, name: p.name, stock: p.stock, unit: p.unit, threshold: p.low_stock_threshold || 10, image_url: p.image_url } }

    # 1 query: product totals
    product_stats = App.db[:products].where(active: true).select(
      Sequel.function(:count, Sequel.lit('*')).as(:total),
      Sequel.lit("SUM(CASE WHEN is_out_of_stock THEN 1 ELSE 0 END)").as(:out_of_stock)
    ).first

    # 1 query: order totals + revenue + COD pending
    order_stats = App.db[:orders].select(
      Sequel.function(:count, Sequel.lit('*')).as(:total),
      Sequel.lit("SUM(CASE WHEN status = 'placed' THEN 1 ELSE 0 END)").as(:pending),
      Sequel.lit("SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END)").as(:revenue),
      Sequel.lit("SUM(CASE WHEN payment_method = 'cod' AND status NOT IN ('delivered','cancelled') THEN total_amount ELSE 0 END)").as(:cod_pending)
    ).first

    # Active customers (non-admin users)
    total_customers = App.db[:users].where(active: true).exclude(role: 0).count

    # 1 query: status breakdown
    status_counts = Order.group_and_count(:status)
                         .each_with_object({}) { |r, h| h[r[:status]] = r[:count] }

    # 1 query: payment method breakdown
    payment_breakdown = App.db[:orders]
      .group_and_count(:payment_method)
      .map { |r| { method: r[:payment_method] || 'other', count: r[:count] } }

    # 1 query: top 5 products by units sold (delivered orders only)
    top_selling_products = App.db[:order_items]
      .join(:orders,   id: Sequel[:order_items][:order_id])
      .join(:products, id: Sequel[:order_items][:product_id])
      .where(Sequel[:orders][:status] => 'delivered')
      .group(Sequel[:products][:id], Sequel[:products][:name])
      .select(
        Sequel[:products][:id].as(:product_id),
        Sequel[:products][:name],
        Sequel.function(:sum, Sequel[:order_items][:quantity]).as(:total_qty),
        Sequel.lit('SUM(order_items.quantity * order_items.unit_price)').as(:total_revenue)
      )
      .order(Sequel.desc(:total_qty))
      .limit(5)
      .all
      .map { |r| { id: r[:product_id], name: r[:name], units_sold: r[:total_qty].to_i, revenue: r[:total_revenue].to_i } }

    # 1 query: daily sales for the current week (Mon–Sun)
    week_start_date = Time.now.utc.to_date
    week_start_date -= (week_start_date.wday - 1) % 7   # roll back to Monday
    week_start_dt   = Time.utc(week_start_date.year, week_start_date.month, week_start_date.day)

    day_rows = App.db[:orders]
      .where { created_at >= week_start_dt }
      .select(
        Sequel.lit('EXTRACT(DOW FROM created_at)::int AS dow'),
        Sequel.function(:count, :id).as(:orders),
        Sequel.function(:sum, :total_amount).as(:revenue)
      )
      .group(Sequel.lit('EXTRACT(DOW FROM created_at)::int'))
      .all
      .each_with_object({}) { |r, h| h[r[:dow]] = { orders: r[:orders].to_i, revenue: r[:revenue].to_i } }

    day_names  = %w[Mon Tue Wed Thu Fri Sat Sun]
    daily_sales = (1..7).map do |i|
      dow = i == 7 ? 0 : i   # DOW: 0=Sun 1=Mon…6=Sat; our array: 0=Mon…6=Sun
      { day: day_names[i - 1], orders: day_rows.dig(dow, :orders) || 0, revenue: day_rows.dig(dow, :revenue) || 0 }
    end

    # 1 query: revenue per calendar month (delivered orders, all time)
    revenue_by_month = App.db[:orders]
      .where(status: 'delivered')
      .select(
        Sequel.lit("TO_CHAR(created_at, 'Mon')    AS month"),
        Sequel.lit("TO_CHAR(created_at, 'YYYY-MM') AS year_month"),
        Sequel.function(:sum, :total_amount).as(:revenue),
        Sequel.function(:count, :id).as(:orders)
      )
      .group(Sequel.lit("TO_CHAR(created_at, 'Mon'), TO_CHAR(created_at, 'YYYY-MM')"))
      .order(Sequel.lit("TO_CHAR(created_at, 'YYYY-MM')"))
      .all
      .map { |r| { month: r[:month], revenue: r[:revenue].to_i, orders: r[:orders].to_i } }

    # Eager-load associations — avoids N+1 per order/review
    recent_orders  = Order.order(Sequel.desc(:created_at)).limit(10)
                          .eager(:user, :address, order_items: :product).all.map(&:to_pos)
    recent_reviews = Review.where(active: true).order(Sequel.desc(:created_at)).limit(5)
                           .eager(:user, :product).all.map(&:to_pos)

    stats = {
      total_products:       product_stats[:total],
      total_categories:     Category.where(active: true).count,
      total_customers:      total_customers,
      total_orders:         order_stats[:total],
      total_revenue:        order_stats[:revenue]    || 0,
      pending_orders:       order_stats[:pending]    || 0,
      cod_pending_amount:   order_stats[:cod_pending] || 0,
      out_of_stock:         product_stats[:out_of_stock] || 0,
      low_stock_count:      low_stock_products.size,
      low_stock_products:   low_stock_products,
      recent_orders:        recent_orders,
      orders_by_status:     Order::ORDER_STATUSES.map { |s| { status: s, count: status_counts[s] || 0 } },
      recent_reviews:       recent_reviews,
      payment_breakdown:    payment_breakdown,
      top_selling_products: top_selling_products,
      daily_sales:          daily_sales,
      revenue_by_month:     revenue_by_month,
    }
    return_success(stats)
  end
end

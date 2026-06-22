class App::Services::Reviews < App::Services::Base
  def model; Review; end

  # Public: GET /products/:product_id/reviews
  def list
    product_id = rp[:product_id].to_i
    ds = model.where(product_id: product_id, active: true).order(Sequel.desc(:created_at))
    count = ds.count
    return_success(
      ds.offset(offset).limit(limit).all.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  # Auth: POST /products/:product_id/reviews
  def create
    product_id = rp[:product_id].to_i
    uid = current_user[:id]

    # Must have purchased and received the product
    purchased = App.db[
      "SELECT 1 FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
       LIMIT 1",
      uid, product_id
    ].count > 0
    return_errors!('You can only review products you have purchased and received', 403) unless purchased

    return_errors!('You have already reviewed this product', 409) if Review.where(user_id: uid, product_id: product_id).first

    rating = params[:rating].to_i
    return_errors!('Rating must be between 1 and 5', 422) unless (1..5).include?(rating)

    obj = Review.new(
      user_id:    uid,
      product_id: product_id,
      rating:     rating,
      comment:    params[:comment]
    )
    save(obj)
  end

  # Admin: GET /admin/reviews
  def admin_list
    ds = model.order(Sequel.desc(:created_at))
    ds = ds.where(product_id: qs[:product_id].to_i) if qs[:product_id].present?
    if qs[:search].present?
      ds = ds.join(:users, id: :user_id)
             .where(Sequel.ilike(Sequel[:users][:full_name], "%#{qs[:search]}%"))
             .select_all(:reviews)
    end
    count = ds.count
    return_success(
      ds.offset(offset).limit(limit).all.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count
    )
  end

  # Admin: DELETE /admin/reviews/:id
  def admin_delete
    review = model[rp[:id].to_i] || return_errors!('Review not found', 404)
    review.update(active: false)
    return_success('Review removed')
  end

  def self.fields
    { save: [:rating, :comment] }
  end
end

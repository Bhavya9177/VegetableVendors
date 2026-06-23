class App::Services::OrderIssues < App::Services::Base
  def model; OrderIssue; end

  def create
    uid      = current_user[:id]
    order_id = rp[:id].to_i
    order    = Order.where(id: order_id, user_id: uid).first
    return_errors!('Order not found', 404) unless order
    return_errors!('Issues can only be reported for delivered orders', 422) unless order.status == 'delivered'
    return_errors!('issue_type is required', 400) if params[:issue_type].blank?
    return_errors!('description is required', 400) if params[:description].blank?
    return_errors!('Invalid issue type', 422) unless OrderIssue::ISSUE_TYPES.include?(params[:issue_type])

    issue = OrderIssue.create(
      order_id:    order_id,
      user_id:     uid,
      issue_type:  params[:issue_type],
      description: params[:description],
      status:      'open'
    )
    return_success(issue.to_pos)
  end

  def list
    uid      = current_user[:id]
    order_id = rp[:id].to_i
    order    = Order.where(id: order_id, user_id: uid).first
    return_errors!('Order not found', 404) unless order

    issues = OrderIssue.where(order_id: order_id).order(Sequel.desc(:created_at)).all
    return_success(issues.map(&:to_pos))
  end

  def admin_list
    ds     = OrderIssue.order(Sequel.desc(:created_at))
    ds     = ds.where(status: qs[:status]) if qs[:status].present?
    count  = ds.count
    issues = ds.offset(offset).limit(limit).eager(:order, :user).all
    return_success(
      issues.map do |i|
        i.to_pos.merge(
          customer_name:  i.user&.full_name,
          customer_phone: i.user&.phone_number,
          order_total:    i.order&.total_amount
        )
      end,
      total_pages: (count / page_size.to_f).ceil,
      total:       count
    )
  end

  def resolve
    issue = OrderIssue[rp[:id].to_i] || return_errors!('Issue not found', 404)
    return_errors!('resolution_type is required', 400) if params[:resolution_type].blank?
    return_errors!('Invalid resolution type', 422) unless OrderIssue::RESOLUTION_TYPES.include?(params[:resolution_type])

    issue.update(
      status:           'resolved',
      resolution_type:  params[:resolution_type],
      resolution_notes: params[:resolution_notes].to_s.strip.presence
    )
    return_success(issue.reload.to_pos)
  end

  def update_status
    issue      = OrderIssue[rp[:id].to_i] || return_errors!('Issue not found', 404)
    new_status = params[:status]
    return_errors!('Invalid status', 422) unless OrderIssue::STATUSES.include?(new_status)
    issue.update(status: new_status)
    return_success(issue.reload.to_pos)
  end

  def self.fields
    { save: [:issue_type, :description, :status, :resolution_type, :resolution_notes] }
  end
end

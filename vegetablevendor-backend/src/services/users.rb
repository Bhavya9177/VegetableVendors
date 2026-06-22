class App::Services::Users < App::Services::Base
  def model; User; end

  RESET_TOKEN_EXPIRATION_TIME = 2 * 60 * 60

  def register
    check_presence!(:email, :full_name)
    return_errors!('Password is required', 400) if params[:password].blank?

    if User.where(email: params[:email].strip).first
      return_errors!('Email already registered', 409)
    end

    obj = User.new(
      full_name: params[:full_name].strip,
      email: params[:email].strip.downcase,
      phone_number: params[:phone_number]&.strip,
      role: 1
    )
    obj.password = params[:password]

    save(obj) do |u|
      token = App::Helpers::CurrentUser.encoded_token(u)
      u.update(current_session_id: token)
      return_success(token: token, info: u.as_pos)
    end
  end

  def list
    # Sort users who have placed orders to the top, then by newest registration
    order_count_subq = model.db[:orders].where(user_id: Sequel[:users][:id]).select { count(:id) }

    ds = model.order(Sequel.desc(order_count_subq), Sequel.desc(:created_at))
    if qs[:search].present?
      term = "%#{qs[:search]}%"
      ds = ds.where(Sequel.ilike(:full_name, term) | Sequel.ilike(:email, term))
    end
    count = ds.count
    users = ds.offset(offset).limit(limit).all

    user_ids = users.map(&:id)
    if user_ids.any?
      order_counts     = Order.where(user_id: user_ids).group_and_count(:user_id).all
                              .each_with_object({}) { |r, h| h[r[:user_id]] = r[:count] }
      delivered_counts = Order.where(user_id: user_ids, status: 'delivered').group_and_count(:user_id).all
                              .each_with_object({}) { |r, h| h[r[:user_id]] = r[:count] }
    else
      order_counts = {}
      delivered_counts = {}
    end

    data = users.map do |u|
      u.as_pos.merge(
        order_count:     order_counts[u.id]     || 0,
        delivered_count: delivered_counts[u.id] || 0
      )
    end

    return_success(data, total_pages: (count / page_size.to_f).ceil, total: count)
  end

  def get
    return_success(item.as_pos)
  end

  def create
    obj = model.new(data_for(:save))
    obj.password = params[:password] if params[:password].present?
    save(obj)
  end

  def info
    return_success(App.cu.user_obj.as_pos)
  end

  def update_profile
    u = App.cu.user_obj
    u.full_name    = params[:full_name].strip    if params[:full_name].present?
    u.phone_number = params[:phone_number].strip if params[:phone_number].present?
    save(u) { return_success(u.as_pos) }
  end

  def update_password
    if App.cu.user_obj.authenticate(params[:current_password])
      u = App.cu.user_obj
      u.password = params[:new_password]
      save(u) { return_success('Password updated successfully') }
    else
      return_errors!('Invalid current password')
    end
  end

  def forgot_password
    email = params[:email]
    return_errors!('Email is required', 400) unless email.present?

    user = App::Models::User.where(email: email.strip.downcase, active: true).first
    if user
      return_success("If that email exists, a reset link will be sent.")
    else
      return_success("If that email exists, a reset link will be sent.")
    end
  end

  def validate_password_token
    token = params['token']
    return_errors!('Token is missing.', 400) if token.blank?

    user = App::Models::User.where(Sequel.pg_jsonb_op(:tokens).get_text('reset') => token).first
    return_success('Token is valid.') if user
    return_errors!('Invalid or expired token.')
  end

  def reset_password
    token = params['token']
    new_password = params['password']
    return_errors!('Token and password are required.', 400) if token.blank? || new_password.blank?

    user = App::Models::User.where(Sequel.pg_jsonb_op(:tokens).get_text('reset') => token).first
    unless user
      return_errors!('Invalid or expired token.', 400)
    end
    user.password = new_password
    user.tokens = (user.tokens || {}).merge('reset' => nil)
    user.save
    return_success('Password has been reset.')
  end

  def self.fields
    {
      save: [:full_name, :email, :role, :phone_number, :active]
    }
  end
end

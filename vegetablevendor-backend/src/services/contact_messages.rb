class App::Services::ContactMessages < App::Services::Base
  def model; ContactMessage; end

  def create
    name    = params[:name].to_s.strip
    email   = params[:email].to_s.strip.downcase
    subject = params[:subject].to_s.strip
    message = params[:message].to_s.strip

    return_errors!('Name is required', 422)    if name.blank?
    return_errors!('Email is required', 422)   if email.blank?
    return_errors!('Message is required', 422) if message.blank?

    obj = ContactMessage.new(name: name, email: email, subject: subject, message: message)
    if obj.valid?
      obj.save
      App.logger.info("Contact message saved — from: #{email}")
      return_success(obj.to_pos)
    else
      return_errors!(obj.errors.full_messages.join(', '), 422)
    end
  rescue => e
    App.logger.error("ContactMessages#create error: #{e.message}")
    return_errors!('Failed to save message', 500)
  end

  def admin_list
    ds = model.order(Sequel.desc(:created_at))
    ds = ds.where(read: false) if qs[:unread] == 'true'
    count = ds.count
    return_success(
      ds.offset(offset).limit(limit).all.map(&:to_pos),
      total_pages: (count / page_size.to_f).ceil,
      total: count,
      unread_count: model.where(read: false).count
    )
  end

  def admin_mark_read
    msg = model[rp[:id].to_i] || return_errors!('Message not found', 404)
    msg.update(read: true)
    return_success(msg.to_pos)
  end

  def admin_delete
    msg = model[rp[:id].to_i] || return_errors!('Message not found', 404)
    msg.delete
    return_success('Message deleted')
  end

  def self.fields
    { save: [:name, :email, :subject, :message] }
  end
end

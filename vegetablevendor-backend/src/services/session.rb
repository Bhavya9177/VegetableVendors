class App::Services::Session < App::Services::Base

  def login
    return_errors!('Email is required', 422) if params[:email].blank?
    return_errors!('Password is required', 422) if params[:password].blank?

    begin
      user = User.find(email: params[:email].strip.downcase, active: true)
      if user && user.authenticate(params[:password])
        user.last_logged_in_at  = Time.now
        user.current_session_id = CurrentUser.encoded_token(user)
        user.save
        return_success(token: user.current_session_id, info: user.as_pos)
      else
        return_errors!('Invalid email or password', 401)
      end
    rescue => e
      App.logger.error("Login error: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
      return_errors!('Login failed. Please try again.', 500)
    end
  end

end
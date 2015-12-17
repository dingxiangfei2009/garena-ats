class AuthController < ApplicationController
  def auth
    # oauth 2.0
    auth_hash = request.env['omniauth.auth']
    # verify if the account is admin
    begin
      admin = Admin.find auth_hash.info.email

      if !admin.google_id
        admin.google_id = auth_hash.uid
        admin.save
      end

      if admin.google_id == auth_hash.uid
        reset_session
        session[:user] = admin
        redirect_to '/tests'
      else
        raise 0
      end
    rescue Exception => e
      redirect_to '/auth/fail'
    end
  end

  def redirect
    redirect_to '/auth/google'
  end

  def fail
  end

  def destroy
    reset_session
    redirect_to '/auth/google'
  end
end

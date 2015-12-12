class EditAdminController < ApplicationController
  def list
  end

  def all
    data = Admin.all.map do |admin|
      {
        name: admin.name,
        email: admin.email
      }
    end
    render json: data
  end

  def new
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    unless Admin.exists? params[:email]
      admin = Admin.new
      admin.email = params[:email]
      admin.name = params[:name]
      admin.save
    end
    render json: {status: 'success'}
  end

  def destroy
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    admin = Admin.find params[:email]
    admin.destroy if admin
    render json: {status: 'success'}
  end

  def update
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    admin = Admin.find params[:id]
    if admin
      admin.name = params[:name]
      admin.email = params[:email]
      admin.save
    end
    render json: {status: 'success'}
  end
end

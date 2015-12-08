class AdminController < ApplicationController
  def new
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    admin = Admin.new
    admin.name = params[:name]
    admin.email = params[:email]
    admin.save
    render :json => admin
  end
  def all
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    adminArray = Array.new
    Admin.all.each do |admin|
      adm = {:name => admin.name, :email => admin.email}
      adminArray.push adm
    end
    render json: adminArray
  end
end

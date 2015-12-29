class TopicsController < ApplicationController
  def new
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    topic = Field.new
    topic.name = params[:name]
    topic.token = params[:token]
    topic.save
    render json: topic
  end
  def all
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    fields = Field.all.map do |field|
      {
        name: field.name,
        token: field.token,
        questions: Question.where(field_id: field.id).count
      }
    end
    render json: fields
  end
  def update
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    field = Field.where(token: params[:token]).first
    field.token = params[:new_token]
    field.name = params[:name]
    field.save
    render json: {status: 'success'}
  end
  def destroy
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    Field.where(token: params[:token]).delete_all
    render json: {status: 'success'}
  end
end

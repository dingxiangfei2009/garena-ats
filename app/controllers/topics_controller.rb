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
    render :json => topic
  end
  def all
    unless session[:user]
      redirect_to '/auth/google'
      return
    end
    topicArray = Array.new
    Field.all.each do |field|
      topic = {:name => field.name, :token => field.token, :questions => Question.where(field_id: field.id).count}
      topicArray.push topic
    end
    render json: topicArray
  end
end

class QuestionTypeController < ApplicationController
  def list
    data = {}
    QuestionType.all.each do |type|
      data[type.name] = type.description
    end
    @data = JSON.generate data
  end
  def save
    data = JSON.parse params[:data]
    data.each do |key, value|
      type = QuestionType.find_by name: key
      type.description = value
      type.save
    end
    render json: {status: 'success'}
  end
end

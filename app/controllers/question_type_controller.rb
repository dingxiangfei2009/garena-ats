class QuestionTypeController < ApplicationController
  def list
    @data = JSON.generate(QuestionType.all.map { |type|
      {name: type.name, description: type.description}
    })
  end
  def save
    data = JSON.parse params[:data]
    data.each do |key, value|
      type = QuestionType.find key
      type.description = value
      type.save
    end
  end
end

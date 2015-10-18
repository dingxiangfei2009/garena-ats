class QuestionController < ApplicationController
	def save
	end
	def new
		begin
			question_type = QuestionType.find_by! name: params[:type]
			field = Field.find_by! token: params[:topic]
			question = Question.new
			question.configuration = params[:configuration]
			question.question_type_id = question_type.id	# link to question type
			question.field_id = field.id
			question.save
			render :json => question
		rescue
			render :json => {:error => "Invalid question type"}
		end
	end
	def get
		question = Question.find params[:id]
		render :json => question
	end
end

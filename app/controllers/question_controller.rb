class QuestionController < ApplicationController
	def save
	end
	def new
		begin
			question_type = QuestionType.find_by! name: params[:type]
			question = Question.new
			question.configuration = params[:configuration],
			question.question_type_id = question_type_id	# link to question type
			question.save
			render :json => question
		rescue
			render :json => Struct.new(:error).new("Invalid question type")
		end
	end
	def get
		question = Question.find params[:id]
		render :json => question
	end
end

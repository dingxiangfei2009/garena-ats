class QuestionController < ApplicationController
	def save
	end
	def new
		begin
			question_type = QuestionType.find_by! name: params[:type]
			field = Field.find_by! token: params[:topic]
			question = Question.new
			question.config = params[:configuration]
			question.description = params[:description]
			question.difficulty = params[:difficulty]
			question.mark = params[:mark]
			question.question_type_id = question_type.id	# link to question type
			question.field_id = field.id
			question.save
			render :json => question
		rescue Exception => e
			render :json => {:error => e}
		end
	end
	def get
		question = Question.find params[:id]
		render :json => question
	end
end

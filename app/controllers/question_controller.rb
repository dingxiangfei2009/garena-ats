class QuestionController < ApplicationController
	@@LIMIT = 100
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
	def enable
		question = Question.find params[:id]
		question.enabled = true
		question.save
	end
	def disable
		question = Question.find params[:id]
		question.enabled = false
		question.save
	end
	def list
        query = Question
            .joins(:question_type, :field)
            .select(:id, :description, :enabled, :mark,
                'fields.name as field_name',
                'fields.token as field_token',
				'question_types.name as question_type_name')
        if params[:disabled] == 'true' or params[:disable] == '1'
            query = query.where(enabled: false)
		else
            query = query.where(enabled: true)
		end

		if params[:topic]
			topic = Field.find_by! token: params[:topic]
			query = query.where(field_id: topic.id)
		end

		if params[:difficulty]
			query = query.where(difficulty: params[:difficulty])
		end

		if params[:type]
			type = QuestionType.find_by! name: params[:type]
			query = query.where(question_type_id: type.id)
		end

        render json: query.offset(params[:offset] || 0).limit(@@LIMIT)
	end
end

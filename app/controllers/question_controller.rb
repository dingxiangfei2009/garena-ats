class QuestionController < ApplicationController
	@@LIMIT = 100
	def edit
		unless session[:user]
			redirect_to '/auth/google'
			return
		end

		question = Question.find_by! id: params[:id]
		@id = question.id
		@question_config = JSON.generate(
			id: @id,
			description: question.description,
			mark: question.mark,
			difficulty: question.difficulty,
			topic: question.field.token,
			configuration: question.configuration
		)
	end
	def save
		unless session[:user]
			redirect_to '/auth/google'
			return
		end

		begin
			question_type = QuestionType.find_by! name: params[:type]
			field = Field.find_by! token: params[:topic]
			question = Question.find_by! id: params[:id]
			question.config = params[:configuration]
			question.difficulty = params[:difficulty]
			question.mark = params[:mark]
			question.question_type_id = question_type.id
			question.field_id = field.id
			question.save
			render json: question
		rescue Exception => e
			render json: {error: e}
		end
	end
	def new
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
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
			render json: question
		rescue Exception => e
			render json: {error: e}
		end
	end
	def get
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		question = Question.find params[:id]
		render :json => question
	end
	def enable
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		question = Question.find params[:id]
		question.enabled = true
		question.save
		render :json => question
	end
	def disable
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		question = Question.find params[:id]
		question.enabled = false
		question.save
		render :json => question
	end
	def list
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
    query = Question
      .joins(:question_type, :field)
      .select(:id, :description, :enabled, :mark, :difficulty,
          'fields.name as field_name',
          'fields.token as field_token',
			'question_types.name as question_type_name')
    if params[:disabled] == 'true' or params[:disabled] == '1'
      query = query.where(enabled: false)
		elsif params[:disabled] == 'false' or params[:disabled] == '0'
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

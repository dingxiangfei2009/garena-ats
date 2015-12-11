require 'candidate'
require 'application'
require 'test'
require 'field'
require 'question'
require 'mcqquestion'
require 'sbcquestion'
require 'sbtquestion'
require 'fibquestion'

class TestController < ApplicationController
	@@LIMIT = 100
	# random_pick_questions
	# select :count questions of :topic at :difficulty level
	def random_pick_questions(var)
		ids = []
		count = Question.where({
			:field_id => var[:topic],
			:difficulty => var[:difficulty],
			:question_type_id => var[:question_type],
			:enabled => true
			}).count
		if count < var[:count] then
			raise "no enought questions"
		end
		i = 0
		while i < var[:count] do
			question = Question.where({
				:field_id => var[:topic],
				:difficulty => var[:difficulty],
				:question_type_id => var[:question_type],
				:enabled => true
				}).where.not(id: ids)
				.offset(rand(count - i)).first
			if question
				ids << question.id
				i += 1
			end
		end
		ids
	end

	###############
	# new
	# POST
	# job [integer]: job id
	# email [string]: email address
	# duration [integer]: duration of test, unit is second
	def new
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		job_id = params[:job]
		job = Job.find job_id
		email = params[:email]
		candidate = Candidate.find_by! email: email
		application =
			Application.find_by! ({
				candidate_id: candidate.id,
				job_id: job_id
			})
		# test generator
		test_parameter = JobTestParameter.find_by! job_id: job_id
		options =
			JSON.parse test_parameter.descriptor

		# order questions by type
		question_set_by_type = {}
		options['topics'].each do |topic|
			field = Field.find_by! token: topic['topic']
			question_type = QuestionType.find_by! name: topic['type']
			question_set_by_type[topic['type']] = [] unless
				question_set_by_type[topic['type']]
			question_set_by_type[topic['type']] +=
				random_pick_questions(
					count: topic['count'],
					topic: field.id,
					question_type: question_type.id,
					difficulty: topic['difficulty']
				)
		end

		question_set = []
		question_set_by_type.each do |type, ids|
			question_set += ids
		end

		test = Test.new
		test.application_id = application.id
        if params[:duration] && params[:duration] != '0'
            test.duration = params[:duration]
        else
            test.duration = options[:duration]
        end
        test.name = job.title + ' Test'
		test.save

		#question_set.shuffle!	# shuffle
		question_set.each do |question_id|
			test_response = TestResponse.new
			test_response.question_id = question_id
			test_response.test_id = test.id
			test_response.save
		end
		render json: {id: test.id}
	end

	def render_question(question)
		case question.question_type.name
		when 'mas'
			renderer = MCQQuestion.new question
			return renderer.render nil
		when 'sbc'
			renderer = SBCQuestion.new question
			return renderer.render nil
		when 'sbt'
			renderer = SBTQuestion.new question
			return renderer.render nil
		when 'fib'
			renderer = FIBQuestion.new question
			return renderer.render nil
		end
	end

	def get
		id = params[:id]
		test = Test.find id
		if !test.start_time then
			test.start_time = Time.now
			test.save
		end
		test_info = Hash.new
		test_info[:info] = test
		test_info[:questions] = []
		test_info[:question_type_infos] = {}
		QuestionType.all.each do |type|
			test_info[:question_type_infos][type.name] = type.description
		end
		test.test_responses.each do |test_response|
			question = test_response.question
			question_info = Hash.new
			question_info[:config] = {
				id: test_response.id,
				answer: test_response.answer,
				updated_at: test_response.updated_at.rfc2822
			}
			question_info[:info] = {
				description: question.description,
				question_type: question.question_type.name,
				config: render_question(question)
			}
			test_info[:questions] << question_info
		end
		render json: test_info
	end

	def save
		id = params[:id]
		test = Test.where('date_add(start_time, interval duration second) >= utc_timestamp()').where(id: id).first
		if test
			responses = JSON.parse params[:answer]
			responses.each do |response|
				test_response = TestResponse.find response['id']
				test_response.answer = response['answer']
				test_response.save
			end
			application = test.application
			application.status = 'pending evaluation'
			application.save
			test.test_responses.each do |response|
				question = response.question
				question_type = question.question_type
				case question_type.name
				when 'mas'
					marker = MCQQuestion.new question
					response.mark = marker.mark response
					response.save
				when 'sbc'
					marker = SBCQuestion.new question
					response.mark = marker.mark response
					response.save
				end
			end
			render json: {status: 'success'}
		else
			render json: {status: 'no record'}
		end
	end

	def save_evaluation
		marks = JSON.parse params[:marks]
		marks.each do |marking|
			test_response = TestResponse.find marking['id']
			test_response.mark = marking['mark']
			test_response.save

			question = test_response.question
			question_type = question.question_type
			case question_type.name
			when 'mas'
				marker = MCQQuestion.new question
				marker.evaluate(test_response, marking['mark'])
			end
		end
	end

	def list
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		query = Test.joins(:candidate, :application, :job)
			.select(
				'tests.id',
				'jobs.id as job_id',
				'jobs.title as job_title',
				'applications.id as application_id',
				'applications.status as application_status',
				'candidates.id as candidate_id',
				'candidates.name as candidate_name',
				'candidates.email as candidate_email')
		if (params[:job])
			query = query.where(['jobs.title like ?', "%#{params[:job]}%"])
		end
		query = query.offset(params[:offset] || 0)
		query = query.limit(@@LIMIT)
		result = query.all.map do |test|
			mark = TestResponse.where(test_id: test.id).sum(:mark)
			total_mark = TestResponse.joins(:question)
				.select('questions.mark')
				.where(test_id: test.id)
				.sum('questions.mark')
			{
				id: test.id,
				job_id: test.job_id,
				job_title: test.job_title,
				application_id: test.application_id,
				application_status: test.application_status,
				candidate_id: test.candidate_id,
				candidate_name: test.candidate_name,
				candidate_email: test.candidate_email,
				mark: mark,
				total_mark: total_mark
			}
		end
		render json: result
	end

	def statistics
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		id = params[:id]
		test = Test.find id
		application = test.application
		job = application.job
		candidate = application.candidate

		test_info = {
			id: id,
			application: {
				id: application.id,
				candidate: {
					id: candidate.id,
					name: candidate.name,
					email: candidate.email
				},
				job: {
					id: job.id,
					title: job.title,
					experience: job.experience
				}
			}
		}
		test_info[:questions] = test.test_responses.map do |test_response|
			# generate statistics
			question = test_response.question
			field = question.field
			total_attempts =
				TestResponse.where(question_id: question.id)
					.count(:test_id, distinct: true)
			lower_mark_attempts =
				TestResponse.where(question_id: question.id)
					.where(['mark <= ?', test_response.mark.to_f])
					.count(:test_id, distinct: true)
			{
				config: {
					id: test_response.id,
					answer: test_response.answer,
					mark: test_response.mark
				},
				info: {
					id: question.id,
					config: question.config,
					description: question.description,
					difficulty: question.difficulty,
					mark: question.mark,
					topic: field.name,
					topic_token: field.token,
					type: question.question_type.name
				},
				statistics: {
					percentile: lower_mark_attempts / total_attempts
				}
			}
		end

		@test_info = JSON.generate(test_info)
		render 'test/report'
	end
end

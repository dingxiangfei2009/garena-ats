require 'candidate'
require 'application'
require 'test'
require 'field'
require 'question'
require 'mcqquestion'

class TestController < ApplicationController
	# random_pick_questions
	# select :count questions of :topic at :difficulty level
	def random_pick_questions(var)
		ids = []
		count = Question.where(
			:field_id => var[:topic],
			:difficulty => var[:difficulty])
			.count
		i = 0
		retry_count = 0
		while i < count && retry_count < 100 do
			question = Question.where(
				:field_id => var[:topic],
				:difficulty => var[:difficulty]
				).where.not(id: ids)
				.offset(rand(count - i)).first
			if question
				ids << question.id
				i += 1
				retry_count = 0
			else
				retry_count += 1
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
		job_id = params[:job]
		email = params[:email]
		begin
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
			question_set = []
			options['topics'].each do |topic|
				field = Field.find_by! token: topic['topic']
				# count = Question.where(field_id: field).count
				question_set +=
					random_pick_questions ({
						:count => topic['count'] / 2,
						:topic => field.id,
						:difficulty => topic['difficulty']
					})

				case topic['difficulty']
				when 1
					question_set +=
						random_pick_questions ({
							:count => topic['count'] - topic['count'] / 2,
							:topic => field.id,
							:difficulty => topic['difficulty'] + 1
						})
				when 2
					question_set +=
						random_pick_questions ({
							:count => topic['count'] / 4,
							:topic => field.id,
							:difficulty => topic['difficulty'] + 1
						})
					question_set +=
						random_pick_questions ({
							:count => topic['count'] - topic['count'] / 4 - topic['count'] / 2,
							:topic => field.id,
							:difficulty => topic['difficulty'] + 1
						})
				when 3
					question_set +=
						random_pick_questions ({
							:count => topic['count'] - topic['count'] / 2,
							:topic => field.id,
							:difficulty => topic['difficulty'] - 1
						})
				end
			end

			test = Test.new
			test.application_id = application.id
			byebug
			test.duration = params[:duration]
			test.save

			question_set.shuffle!	# shuffle
			question_set.each do |question_id|
				test_response = TestResponse.new
				test_response.question_id = question_id
				test_response.test_id = test.id
				test_response.save
			end
			render :json => {:id => test.id}
		rescue Exception => e
			render :json => e
		end
	end
	def render_question(question)
		case question.question_type.name
		when 'mas'
			renderer = MCQQuestion.new question
			return renderer.render nil
		end
	end
	def get
		id = params[:id]
		test = Test.find id
		if (!test.start_time)
			test.start_time = Time.now
			test.save
		end
		test_info = Hash.new
		test_info[:info] = test
		test_info[:questions] = []
		test.test_responses.each do |test_response|
			question = test_response.question
			question_info = Hash.new
			question_info[:config] = {
				:id => test_response.id,
				:answer => test_response.answer
			}
			question_info[:info] = {
				:description => question.description,
				:question_type => question.question_type.name,
				:config => render_question(question)
			}
			test_info[:questions] << question_info
		end
		render :json => test_info
	end
	def save
		id = params[:id]
		test = Test.where('date_add(start_time, interval duration second) >= now()').where(id: id).first
		byebug
		responses = JSON.parse params[:answer]
		responses.each do |response|
			test_response = TestResponse.find response['id']
			test_response.answer = response['answer']
			test_response.save
		end
		test.test_responses.each do |response|
			question = response.question
			question_type = question.question_type
			case question_type.name
			when 'mas'
				marker = MCQQuestion.new question
				response.mark = marker.mark response
				response.save
			end
		end
		render :json => {status: 'success'}
	end
end

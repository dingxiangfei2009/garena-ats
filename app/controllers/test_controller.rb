require 'candidate'
require 'application'
require 'test'
require 'field'
require 'question'

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
		while i < count do
			question = Question.where(
				:field_id => var[:topic],
				:difficulty => var[:difficulty]
				).where.not(id: ids)
				.offset(rand(count - i)).first
			ids << question.id if question
			i += 1
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
			byebug
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
				field = Field.find_by! token: topic['token']
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
	def get
		id = params[:id]
		test = Test.find id
		test_info = Hash.new
		test_info[:info] = test
		test_info[:questions] = []
		test.test_responses.each do |test_response|
			question_info = Hash.new
			question_info[:config] = test_response
			question_info[:info] = test_response.question
			test_info[:question_info] << question_info
		end
		render :json => test_info
	end
	def save
		#
	end
end

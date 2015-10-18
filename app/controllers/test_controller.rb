class TestController < ApplicationController
	# random_pick_questions
	# select :count questions of :topic at :difficulty level
	# with sampling range :sample
	def random_pick_questions(var)
		ids = []
		0.upto var[:count] - 1 do
			question = Field.where(
				:field_id => var[:topic],
				:difficulty => var[:difficulty]
				).where.not(id: ids)
				.offset(rand(var[:sample])).first
			ids << question.id
		end
		ids
	end
	###############
	def new
		job_id = param[:job]
		email = param[:email]
		begin
			candidate = Candidate.find_by! email: email
			application = Application.find_by!
				candidate_id: candidate.id,
				job_id: job_id
			test = Test.new
			test.application_id = application.id
			test.save
			# test generator
			test_parameter = JobTestParameter.find_by!(job_id: job_id).first
			options = 
				JSON.parse test_parameter.descriptor, symbolized_names: true
			options.topics.each do |topic|
				field = Field.find_by! token: topic.token
				count = field.count
				question_set = []
				question_set += random_pick_questions
					:count => topic.count / 2,
					:topic => field.id,
					:difficulty => topic.difficulty,
					:sample => count

				case topic.difficulty
				when 1
					question_set += random_pick_questions
						:count => topic.count - topic.count / 2,
						:topic => field.id,
						:difficulty => topic.difficulty + 1,
						:sample => count
				when 2
					question_set += random_pick_questions
						:count => topic.count / 4,
						:topic => field.id,
						:difficulty => topic.difficulty + 1,
						:sample => count
					question_set += random_pick_questions
						:count => topic.count - topic.count / 4 - topic.count / 2,
						:topic => field.id,
						:difficulty => topic.difficulty + 1,
						:sample => count
				when 3
					question_set += random_pick_questions
						:count => topic.count - topic.count / 2,
						:topic => field.id,
						:difficulty => topic.difficulty - 1,
						:sample => count
				end
			end
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
		#
	end
	def save
		#
	end
end

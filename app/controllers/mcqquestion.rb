require 'models/question'
require 'models/question_statistic'

class MCQQuestion {
	self.token = 'mcq'
	def initialize(config)
		@description = config['description']
		@choices = config['choices']
		@mark_scheme = config['mark_scheme']
	end
	# render the question
	def render(question_config)
		question_options = question_config['options']
	end
	def mark(question_config, answer)
		count = 0;
		answer_options = answer['options']
		answer_options.each do |answer_option|
			if @choices[answer_option]['correct']
				count += 1
			end
		end
		@mark_scheme[answer_options.length][count]	# return
	end
	def get_statistics(question, options)
		counts = Hash.new
		statistics = question.question_statistic
		if !statistics
			statistics = QuestionStatistic.new
		end
		# we only count backward to a given timespan
		options[:timespan] = options[:timespan] or DateTime.now
		responses = Question.joins(:test_responses).select('answer').where(
			test_responses: {
				id: question.id
				})
			.where('test_responses.updated_at > ?', options[:timespan]);
		responses.each do |response|
			answer = JSON.parse response.answer
			answer.each do |answer_option|
				if counts[answer_option]
					counts[answer_option] += 1
				else
					counts[answer_option] = 1
				end
			end
		end
	end
}
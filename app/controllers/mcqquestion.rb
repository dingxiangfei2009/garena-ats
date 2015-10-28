require 'models/question'
require 'models/question_statistic'
require 'json'

class MCQQuestion {
	self.token = 'mcq'
	def initialize(question)
		config = JSON.parse question.config
		@id = question.id
		@description = config['description']
		@choices = config['answer']
		@mark_scheme = config['mark_scheme']
		@mark_scheme = []	# TODO flexible marking scheme
		@mark = question.mark
	end
	# render the question
	def render(question_config)
		question_options = question_config['options']
	end
	def mark(test_response)
		count = 0;
		answer = JSON.parse test_response.answer
		answer_options = answer['options']
		QuestionStatistic.destroy_all(
			question_id: @id,
			test_response_id: test_response.id)
		answer_options.each do |answer_option|
			if @choices[answer_option]['correct']
				count += 1
			end
			question_statistic_tag = 'mcq:' + answer_option + ':chosen'
			question_statistic =
				QuestionStatistic.find_by(
					question_id: @id,
					test_response_id: test_response.id,
					tag: question_statistic_tag)
			if !question_statistic
				question_statistic = QuestionStatistic.new
				question_statistic.question_id = @id
				question_statistic.test_response_id = test_response.id
				question_statistic.tag = question_statistic_tag
			end
			question_statistic.value = 1
			question_statistic.save
		end
		correct_total = @choices.count { |choice| choice['correct'] }
		# TODO flexible marking scheme
		@mark_scheme[correct_total] = Array.new(answer_options) {|i| 0};
		@mark_scheme[correct_total][correct_total] = mark;
		@mark_scheme[correct_total][count]	# return
	end
	def statistics(question, options)
		counts = Hash.new
		@choices.each do |choice, key|
			count = QuestionStatistic.where(
				question_id: @id,
				tag: 'mcq:' + choice + ':chosen')
				.sum(:value)
			counts[key] = count
		end
		counts
		# statistics = question.question_statistic
		# if !statistics
		# 	statistics = QuestionStatistic.new
		# 	statistics.question_id = question.id
		# end
		# we only count backward to a given timespan
		# options[:timespan] = options[:timespan] or DateTime.now
		# responses = Question.joins(:test_responses).select('answer').where(
		# 	test_responses: {
		# 		id: question.id
		# 		})
		# 	.where('test_responses.updated_at > ?', options[:timespan]);
		# responses.each do |response|
		# 	answer = JSON.parse response.answer
		# 	answer.each do |answer_option|
		# 		if counts[answer_option]
		# 			counts[answer_option] += 1
		# 		else
		# 			counts[answer_option] = 1
		# 		end
		# 	end
		# end
		# statistics.data = JSON.generate counts
		# statistics.save
		# statistics
	end
}
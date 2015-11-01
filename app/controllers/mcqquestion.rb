require 'question'
require 'question_statistic'
require 'json'

class MCQQuestion
	@@token = 'mas'
	def initialize(question)
		config = JSON.parse question.config
		@id = question.id
		@description = question.description
		@choices = config['answer']
		@mark_scheme = config['mark_scheme']
		@mark_scheme = []	# TODO flexible marking scheme
		@mark = question.mark
	end
	# render the question
	def render(question_config)
		render_config = Hash.new
		render_config[:answer] = []
		@choices.each do |choice|
			render_config[:answer] << {:description => choice['description']}
		end
		JSON.generate render_config
	end
	def mark(test_response)
		byebug
		count = 0;
		return 0 if test_response.answer === nil
		answer = JSON.parse test_response.answer
		answer_choices = answer['choices']
		QuestionStatistic.destroy_all(
			question_id: @id,
			test_response_id: test_response.id)
		answer_choices.each do |answer_option|
			next if !@choices[answer_option]
			if @choices[answer_option]['correct']
				count += 1
			end
			question_statistic_tag = "mas:#{answer_option}:chosen"
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
			question_statistic.latest = Time.now
			question_statistic.save
		end
		correct_total = @choices.count { |choice| choice['correct'] }
		# TODO flexible marking scheme
		@mark_scheme[correct_total] = Array.new(@choices.length + 1, 0)
		@mark_scheme[correct_total][correct_total] = @mark;
		@mark_scheme[correct_total][count] || 0	# return
	end
	def statistics(question, options)
		counts = Hash.new
		@choices.each do |choice, key|
			count = QuestionStatistic.where(
				question_id: @id,
				tag: "mas:#{choice}:chosen")
				.sum(:value)
			counts[key] = count
		end
		counts
	end
end
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
		correct_count = wrong_count = 0;
		return 0 if test_response.answer === nil
		answer = JSON.parse test_response.answer
		answer_choices = answer['choices']
		QuestionStatistic.destroy_all(
			question_id: @id,
			test_response_id: test_response.id)
		answer_choices.each do |answer_option|
			next if !@choices[answer_option]
			if @choices[answer_option]['correct']
				correct_count += 1
			else
				wrong_count += 1
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
		if wrong_count
			mark = 0
		elsif correct_total == correct_count
			mark = @mark
		elsif correct_total - 1 == correct_count
			mark = @mark - 1
		else
			mark = 0
		end
		QuestionStatistic.create(
			question_id: @id,
			test_response_id: test_response.id,
			tag: "mas:mark",
			latest: Time.now,
			value: mark)
		mark
	end
	def evaluate(test_response, mark)
		question_statistic = QuestionStatistic.find(
			question_id: @id,
			test_response_id: test_response.id,
			tag: "mas:mark")
		if question_statistic then
			question_statistic.value = mark
		else
			QuestionStatistic.create(
				question_id: @id,
				test_response_id: test_response.id,
				tag: "mas:mark",
				value: mark)
		end
		mark
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
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
				count += 1;
		end
		@mark_scheme[answer_options.length][count]	# return
	end
}
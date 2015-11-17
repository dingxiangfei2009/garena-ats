class SBTQuestion
	@@token = 'sbt'
	def initialize(question)
		@config = JSON.parse question.config
		@id = question.id
		@description = question.description
		@mark = question.mark
	end
	def render(question_config)
		JSON.generate answer: Hash.new
	end
	def mark(answer)
		nil
	end
end
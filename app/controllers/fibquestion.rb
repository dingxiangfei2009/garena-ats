class FIBQuestion
	@@token = 'fib'
	def initialize(question)
		@config = JSON.parse question.config
		@id = question.id
		@description = question.description
		@mark = question.mark
	end
	def render(question_config)
    render_config = Hash.new
		render_config[:answer] = {}
    answer = @config['answer']
		render_config[:answer] = {:statement => answer['statement']}
		JSON.generate render_config
	end
	def mark(answer)
		nil
	end
end

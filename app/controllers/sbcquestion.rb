class SBCQuestion
    @@token = 'sbc'
    def initialize(question)
        @config = JSON.parse question.config
        @id = question.id
        @description = question.description
        @mark = question.mark
    end
    def render(question_config)
        JSON.generate stub: @config['answer']['stub']
    end
    def mark(answer)
        nil
    end
end

class EvaluateController < ApplicationController
    def evaluate
        @id = params[:id]
        test = Test.find @id
        test_info = Hash.new
        test_info[:id] = @id
        application = test.application
        test_info[:application] = {
            id: application.id
        }
        candidate = application.candidate
        test_info[:application][:candidate] = {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email
        }
        job = application.job
        test_info[:application][:job] = {
            id: job.id,
            title: job.title,
            description: job.description,
            experience: job.experience
        }
        test_info[:questions] = []
        test.test_responses.each do |response|
            question = response.question
            question_info = Hash.new
            question_info[:info] = {
                topic: question.field.name,
                topic_token: question.field.token,
                type: question.question_type.name,
                description: question.description,
                config: question.config,
                difficulty: question.difficulty,
                mark: question.mark,
                enabled: question.enabled
            }
            question_info[:config] = {
                id: response.id,
                answer: response.answer,
                mark: response.mark || 0
            }
            test_info[:questions] << question_info
        end
        
        @test_info = JSON.generate test_info
    end
    def get
    end
    def save
    end
end

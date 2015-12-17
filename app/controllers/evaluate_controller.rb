class EvaluateController < ApplicationController
    def evaluate
    		unless session[:user]
      			redirect_to '/auth/google'
      			return
    		end
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
    def save
    		unless session[:user]
    			redirect_to '/auth/google'
    			return
    		end
        marks = JSON.parse params[:marks]
        marks.each do |mark|
            test_response = TestResponse.find_by id: mark['id'], test_id: params[:id]
            test_response.mark = mark['mark']
            test_response.save
        end
        test = Test.find params[:id]
        application = test.application
        application.status = 'evaluated';
        application.save
        render json: JSON.generate({status: 'success'})
    end
end

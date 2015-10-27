class QuestionStatistic < ActiveRecord::Base
	self.table_name = :question_statistics
	has_one :question
	has_many :test_responses, through: :questions
end

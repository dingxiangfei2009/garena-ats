class Question < ActiveRecord::Base
	self.table_name = 'questions'
	has_many :tests, through: :test_responses
    belongs_to :field
	belongs_to :question_type
	belongs_to :question_statistic
end
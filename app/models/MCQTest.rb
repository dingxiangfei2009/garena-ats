class MCQTest < ActiveRecord::Base
	self.table_name = 'mcq_tests'
	has_one :application
	has_many :mcq_questions, through: :mcq_responses
end
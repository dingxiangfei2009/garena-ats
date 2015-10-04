class MCQQuestion < ActiveRecord::Base
	self.table_name = 'mcq_questions'
	has_many :mcq_tests, through: :mcq_responses
	has_one :fields
end
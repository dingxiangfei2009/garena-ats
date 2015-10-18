class MCQQuestion < ActiveRecord::Base
	self.table_name = 'mcq_questions'
	has_many :tests, through: :test_responses
	has_one :fields
end
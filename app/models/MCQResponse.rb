class MCQResponse < ActiveRecord::Base
	self.table_name = 'mcq_responses'
	has_one :mcq_test
	has_one :mcq_questions
end
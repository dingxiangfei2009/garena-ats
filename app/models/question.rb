class Question < ActiveRecord::Base
	self.table_name = 'questions'
	has_many :tests, through: :test_responses
	has_one :fields
end
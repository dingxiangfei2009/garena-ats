class Test < ActiveRecord::Base
	self.table_name = 'tests'
	has_one :application
	has_many :test_responses
	has_many :questions, through: :test_responses
end
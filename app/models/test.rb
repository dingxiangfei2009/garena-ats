class Test < ActiveRecord::Base
	self.table_name = 'tests'
	belongs_to :application, inverse_of: :test
	has_many :test_responses
	has_many :questions, through: :test_responses
end
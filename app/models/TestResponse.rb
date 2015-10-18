class TestResponse < ActiveRecord::Base
	self.table_name = 'test_responses'
	has_one :test
	has_one :question
end
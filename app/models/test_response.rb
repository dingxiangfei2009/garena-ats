class TestResponse < ActiveRecord::Base
	self.table_name = 'test_responses'
	belongs_to :test
	belongs_to :question
end
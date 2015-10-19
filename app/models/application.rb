class Application < ActiveRecord::Base
	self.table_name = 'applications'
	has_one :candidate
	has_one :test
	has_one :job
	has_many :test_responses, through: :test
end
class Application < ActiveRecord::Base
	self.table_name = 'applications'
	has_one :candidate
	has_one :mcq_test
	has_one :job
	has_many :mcq_responses, through: mcq_test
end
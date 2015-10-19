class JobTestParameter < ActiveRecord::Base
	self.table_name = 'job_test_parameters'
	has_one :job
end
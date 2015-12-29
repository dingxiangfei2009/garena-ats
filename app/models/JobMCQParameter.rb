class JobMCQParameter < ActiveRecord::Base
	self.table_name = 'job_mcq_parameters'
	has_one :job
end
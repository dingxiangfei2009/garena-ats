class Job < ActiveRecord::Base
	self.table_name = 'jobs'
	has_many :fields, through: :job_fields
	has_one :job_test_parameter
	belongs_to :application
end
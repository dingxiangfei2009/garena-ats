class Application < ActiveRecord::Base
	self.table_name = 'applications'
	belongs_to :candidate
	has_one :test
	belongs_to :job
	has_many :test_responses, through: :test
end
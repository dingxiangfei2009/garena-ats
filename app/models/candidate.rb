class Candidate < ActiveRecord::Base
	self.table_name = :candidates
	has_many :applications
	has_many :fields, through: :candidate_fields
end

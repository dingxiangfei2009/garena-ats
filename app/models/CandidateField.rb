class CandidateField < ActiveRecord::Base
	self.table_name = 'candidate_fields'
	has_one :candidate
	belongs_to :field
end
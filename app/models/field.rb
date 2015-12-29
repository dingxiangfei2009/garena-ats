class Field < ActiveRecord::Base
	has_many :jobs, through: :job_fields
	has_many :candidates, through: :candidate_fields
end
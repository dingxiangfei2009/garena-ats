class JobField < ActiveRecord::Base
	has_one :job
	has_one :field
end
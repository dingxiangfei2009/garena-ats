class JobField < ActiveRecord::Base
	belongs_to :job
	belongs_to :field
end

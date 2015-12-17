class Admin < ActiveRecord::Base
	self.table_name = 'admins'
	self.primary_key = 'email'
end

class Admin < ActiveRecord::Base
	self.table_name = 'admins'
	has_one :user
end
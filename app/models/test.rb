class Test < ActiveRecord::Base
	self.table_name = 'tests'
	belongs_to :application, inverse_of: :test
	has_one :candidate, through: :application
	has_one :job, through: :application
	has_many :test_responses
	has_many :questions, through: :test_responses
	before_create :random_id
	
	private
	def random_id
		begin
			self.id = SecureRandom.random_number(2147483648)
		end while Model.where(id: self.id).exists?
	end
end

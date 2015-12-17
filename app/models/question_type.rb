class QuestionType < ActiveRecord::Base
	self.table_name = 'question_types'
	has_many :questions
end

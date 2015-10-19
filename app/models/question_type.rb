class QuestionType < ActiveRecord::base
	self.table_name = 'question_types'
	has_many :questions
end
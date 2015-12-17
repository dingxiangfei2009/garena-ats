class QuestionStatistic < ActiveRecord::Base
	self.table_name = :question_statistics
	belongs_to :question
	belongs_to :test_response
end

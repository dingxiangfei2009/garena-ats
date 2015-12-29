class CreateMcqResponsesTable < ActiveRecord::Migration
  def change
    create_table :mcq_responses do |t|
    	t.integer :answer
    end
    add_foreign_key :mcq_responses, :mcq_tests
    add_foreign_key :mcq_responses, :mcq_questions
  end
end

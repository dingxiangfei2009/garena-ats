class CreateMcqQuestionsTable < ActiveRecord::Migration
  def change
    create_table :mcq_questions do |t|
    	t.text :description
    	t.integer :answer
    	t.text :answerA
    	t.text :answerB
    	t.text :answerC
    	t.text :answerD
    	t.integer :difficulty
    end
    add_foreign_key :mcq_questions, :fields
  end
end

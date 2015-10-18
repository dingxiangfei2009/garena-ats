class CreateQuestionsTable < ActiveRecord::Migration
  def change
    create_table :question_types do |t|
        t.string :name
    end
    create_table :questions do |t|
    	t.text :description
        t.text :config
    	t.integer :difficulty
    end
    add_foreign_key :questions, :fields
    add_foreign_key :questions, :question_types
  end
end

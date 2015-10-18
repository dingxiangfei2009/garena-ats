class CreateQuestionsTable < ActiveRecord::Migration
  def change
    create_table :question_types do |t|
        t.string :name, unique: true
    end
    create_table :questions do |t|
    	t.text :description
        t.text :config
    	t.integer :difficulty
        t.references :field, null: false, index: true
        t.references :question_type, null: false, index: true
    end
    add_foreign_key :questions, :fields
    add_foreign_key :questions, :question_types
  end
end

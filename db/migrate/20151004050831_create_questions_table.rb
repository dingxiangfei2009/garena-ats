class CreateQuestionsTable < ActiveRecord::Migration
  def change
    create_table :question_types do |t|
        t.string :name, unique: true
        t.text :description
    end
    create_table :questions do |t|
    	t.text :description
        t.text :config
    	t.integer :difficulty
        t.integer :mark
        t.references :field, null: false, index: true
        t.references :question_type, null: false, index: true
        t.boolean :enabled, default: true
    end
    add_foreign_key :questions, :fields, on_delete: :cascade
    add_foreign_key :questions, :question_types, on_delete: :cascade
  end
end

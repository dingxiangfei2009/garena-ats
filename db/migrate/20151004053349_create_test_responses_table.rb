class CreateTestResponsesTable < ActiveRecord::Migration
  def change
    create_table :test_responses do |t|
    	t.text :answer
    	t.text :configuration
    	t.float :mark
    	t.timestamps null: false
        t.references :test, null: false
        t.references :question, null: false
    end
    add_foreign_key :test_responses, :tests
    add_foreign_key :test_responses, :questions
  end
end

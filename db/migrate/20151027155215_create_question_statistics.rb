class CreateQuestionStatistics < ActiveRecord::Migration
  def change
    create_table :question_statistics do |t|
      t.references :question, null: false
      t.references :test_response, null: false
      t.text :data
      t.string :tag
      t.float :value
      t.datetime :latest, null: false
      t.timestamps null: false
    end
    add_foreign_key :question_statistics, :questions
    add_foreign_key :question_statistics, :test_responses
  end
end

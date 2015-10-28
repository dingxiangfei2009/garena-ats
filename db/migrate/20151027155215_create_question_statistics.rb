class CreateQuestionStatistics < ActiveRecord::Migration
  def change
    create_table :question_statistics do |t|
      t.references :question, null: false
      t.text :data
      t.string :tag
      t.float :value
      t.datetime :latest, null: false
      t.timestamps null: false
    end
    add_foreign_key :question_statistics, :questions
  end
end

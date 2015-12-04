class CreateCandidateFieldTable < ActiveRecord::Migration
  def change
    create_table :candidate_fields do |t|
    	t.references :candidate, null: false, index: true
    	t.references :field, null: false, index: true
    end
    add_foreign_key :candidate_fields, :candidates, on_delete: :cascade
    add_foreign_key :candidate_fields, :fields, on_delete: :cascade
  end
end

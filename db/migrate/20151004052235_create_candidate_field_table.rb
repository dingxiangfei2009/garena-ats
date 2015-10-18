class CreateCandidateFieldTable < ActiveRecord::Migration
  def change
    create_table :candidate_fields do |t|
    	t.references :candidate, null: false, index: true
    	t.references :field, null: false, index: true
    end
    add_foreign_key :candidate_fields, :candidates
    add_foreign_key :candidate_fields, :fields
  end
end

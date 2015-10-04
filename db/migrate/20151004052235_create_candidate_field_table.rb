class CreateCandidateFieldTable < ActiveRecord::Migration
  def change
    create_table :candidate_fields do |t|
    end
    add_foreign_key :candidate_fields, :candidates
    add_foreign_key :candidate_fields, :fields
  end
end

class CreateJobFieldTable < ActiveRecord::Migration
  def change
    create_table :job_fields do |t|
    	t.references :job, null: false, index: true
    	t.references :field, null: false, index: true
    end
    add_foreign_key :job_fields, :jobs, on_delete: :cascade
    add_foreign_key :job_fields, :fields, on_delete: :cascade
  end
end

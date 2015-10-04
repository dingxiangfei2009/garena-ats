class CreateJobFieldTable < ActiveRecord::Migration
  def change
    create_table :job_fields do |t|
    end
    add_foreign_key :job_fields, :jobs
    add_foreign_key :job_fields, :fields
  end
end

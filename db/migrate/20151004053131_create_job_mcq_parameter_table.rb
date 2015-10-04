class CreateJobMcqParameterTable < ActiveRecord::Migration
  def change
    create_table :job_mcq_parameters do |t|
    	t.text :descriptor
    end
    add_foreign_key :job_mcq_parameters, :jobs
  end
end

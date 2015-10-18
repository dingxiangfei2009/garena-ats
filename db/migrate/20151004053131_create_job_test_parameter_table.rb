class CreateJobTestParameterTable < ActiveRecord::Migration
  def change
    create_table :job_test_parameters do |t|
    	t.text :descriptor
    end
    add_foreign_key :job_test_parameters, :jobs
  end
end

class CreateApplicationsTable < ActiveRecord::Migration
  def change
    create_table :applications do |t|
    	t.timestamps null: false
    	t.references :candidate, null: false, index: true
    	t.references :job, null: false, index: true
    end
    add_foreign_key :applications, :candidates
   	add_foreign_key :applications, :jobs
  end
end

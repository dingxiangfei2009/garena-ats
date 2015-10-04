class CreateApplicationsTable < ActiveRecord::Migration
  def change
    create_table :applications do |t|
    	t.timestamps null: false
    end
    add_foreign_key :applications, :candidates
   	add_foreign_key :applications, :jobs
  end
end

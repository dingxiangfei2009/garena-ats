class CreateApplicationsTable < ActiveRecord::Migration
  def change
    create_table :applications do |t|
    	t.timestamps null: false
    	t.references :candidate, null: false, index: true
    	t.references :job, null: false, index: true
        t.string :status
    end
    add_foreign_key :applications, :candidates, on_delete: :cascade
   	add_foreign_key :applications, :jobs, on_delete: :cascade
  end
end

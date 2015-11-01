class CreateTestsTable < ActiveRecord::Migration
  def change
    create_table :tests do |t|
    	t.timestamps null: false
    	t.references :application, null: false
    	t.integer :duration, null: false
    	t.datetime :start_time
    end
    add_foreign_key :tests, :applications
  end
end

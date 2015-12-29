class CreateMcqTestsTable < ActiveRecord::Migration
  def change
    create_table :mcq_tests do |t|
    	t.timestamps null: false
    end
    add_foreign_key :mcq_tests, :applications
  end
end

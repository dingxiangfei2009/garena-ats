class CreateTestsTable < ActiveRecord::Migration
  def change
    create_table :tests do |t|
    	t.timestamps null: false
    end
    add_foreign_key :tests, :applications
  end
end

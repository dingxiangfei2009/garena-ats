class CreateTestsTable < ActiveRecord::Migration
  def change
    create_table :tests do |t|
    	t.timestamps null: false
    	t.references :application, null: false
    	t.integer :duration, null: false
    	t.datetime :start_time
        t.string :name
    end
    change_column :tests, :id, :integer
    add_foreign_key :tests, :applications, on_delete: :cascade
  end
end

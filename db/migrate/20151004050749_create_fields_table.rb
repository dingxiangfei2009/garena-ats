class CreateFieldsTable < ActiveRecord::Migration
  def change
    create_table :fields do |t|
    	t.string :name
    end
  end
end

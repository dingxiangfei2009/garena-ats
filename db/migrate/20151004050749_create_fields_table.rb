class CreateFieldsTable < ActiveRecord::Migration
  def change
    create_table :fields do |t|
    	t.string :name
    	t.string :token, unique: true
    end
  end
end

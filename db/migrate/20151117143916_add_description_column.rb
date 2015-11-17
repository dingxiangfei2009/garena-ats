class AddDescriptionColumn < ActiveRecord::Migration
  def change
  	change_table :candidates do |t|
  		t.text :description
  		t.string :first_name
  		t.string :last_name
  	end
  end
end

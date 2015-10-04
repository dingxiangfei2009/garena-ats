class CreateCandidatesTable < ActiveRecord::Migration
  def change
    create_table :candidates do |t|
    	t.string :name
    	t.string :cvName
    	t.string :email
    	t.timestamps null: false
    end
    add_index :candidates, :email, unique: true
  end
end

class CreateCandidatesTable < ActiveRecord::Migration
  def change
    create_table :candidates do |t|
    	t.string :name
    	t.string :cvName
    	t.string :email, unique: true
    	t.timestamps null: false
    end
  end
end

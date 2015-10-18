class CreateAdminsTable < ActiveRecord::Migration
  def change
    create_table :admins do |t|
    	t.references :user, null: false
    end
    add_foreign_key :admins, :users
  end
end

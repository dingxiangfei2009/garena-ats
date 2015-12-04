class CreateAdminsTable < ActiveRecord::Migration
  def change
    create_table :admins do |t|
    	t.references :user, null: false
      t.string :email, null: false
      t.string :name
      t.string :google_id
    end
  end
end

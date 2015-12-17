class CreateAdminsTable < ActiveRecord::Migration
  def change
    create_table :admins, primary_key: 'email', id: false do |t|
      t.string :email, null: false, unique: true
      t.string :name
      t.string :google_id
    end
  end
end

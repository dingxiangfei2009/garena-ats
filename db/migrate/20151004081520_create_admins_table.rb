class CreateAdminsTable < ActiveRecord::Migration
  def change
    create_table :admins do |t|
    end
    add_foreign_key :users
  end
end

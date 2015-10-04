class CreateJobsTable < ActiveRecord::Migration
  def change
    create_table :jobs do |t|
    	t.string :title
    	t.string :department
    	t.text :description
    end
  end
end

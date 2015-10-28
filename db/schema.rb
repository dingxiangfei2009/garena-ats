# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20151027155215) do

  create_table "admins", force: :cascade do |t|
    t.integer "user_id", limit: 4, null: false
  end

  add_index "admins", ["user_id"], name: "fk_rails_378b9734e4", using: :btree

  create_table "applications", force: :cascade do |t|
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.integer  "candidate_id", limit: 4, null: false
    t.integer  "job_id",       limit: 4, null: false
  end

  add_index "applications", ["candidate_id"], name: "index_applications_on_candidate_id", using: :btree
  add_index "applications", ["job_id"], name: "index_applications_on_job_id", using: :btree

  create_table "candidate_fields", force: :cascade do |t|
    t.integer "candidate_id", limit: 4, null: false
    t.integer "field_id",     limit: 4, null: false
  end

  add_index "candidate_fields", ["candidate_id"], name: "index_candidate_fields_on_candidate_id", using: :btree
  add_index "candidate_fields", ["field_id"], name: "index_candidate_fields_on_field_id", using: :btree

  create_table "candidates", force: :cascade do |t|
    t.string   "name",       limit: 255
    t.string   "cv_name",    limit: 255
    t.string   "email",      limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "fields", force: :cascade do |t|
    t.string "name",  limit: 255
    t.string "token", limit: 255
  end

  create_table "job_fields", force: :cascade do |t|
    t.integer "job_id",   limit: 4, null: false
    t.integer "field_id", limit: 4, null: false
  end

  add_index "job_fields", ["field_id"], name: "index_job_fields_on_field_id", using: :btree
  add_index "job_fields", ["job_id"], name: "index_job_fields_on_job_id", using: :btree

  create_table "job_test_parameters", force: :cascade do |t|
    t.text    "descriptor", limit: 65535
    t.integer "job_id",     limit: 4,     null: false
  end

  add_index "job_test_parameters", ["job_id"], name: "index_job_test_parameters_on_job_id", using: :btree

  create_table "jobs", force: :cascade do |t|
    t.string "title",       limit: 255
    t.string "department",  limit: 255
    t.text   "description", limit: 65535
  end

  create_table "question_statistics", force: :cascade do |t|
    t.integer  "question_id", limit: 4,     null: false
    t.text     "data",        limit: 65535
    t.string   "tag",         limit: 255
    t.float    "value",       limit: 24
    t.datetime "latest",                    null: false
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  add_index "question_statistics", ["question_id"], name: "fk_rails_6f50128e12", using: :btree

  create_table "question_types", force: :cascade do |t|
    t.string "name", limit: 255
  end

  create_table "questions", force: :cascade do |t|
    t.text    "description",      limit: 65535
    t.text    "config",           limit: 65535
    t.integer "difficulty",       limit: 4
    t.integer "mark",             limit: 4
    t.integer "field_id",         limit: 4,     null: false
    t.integer "question_type_id", limit: 4,     null: false
  end

  add_index "questions", ["field_id"], name: "index_questions_on_field_id", using: :btree
  add_index "questions", ["question_type_id"], name: "index_questions_on_question_type_id", using: :btree

  create_table "test_responses", force: :cascade do |t|
    t.text     "answer",      limit: 65535
    t.text     "config",      limit: 65535
    t.float    "mark",        limit: 24
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.integer  "test_id",     limit: 4,     null: false
    t.integer  "question_id", limit: 4,     null: false
  end

  add_index "test_responses", ["question_id"], name: "fk_rails_82d634b1f7", using: :btree
  add_index "test_responses", ["test_id"], name: "fk_rails_6222650686", using: :btree

  create_table "tests", force: :cascade do |t|
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.integer  "application_id", limit: 4, null: false
  end

  add_index "tests", ["application_id"], name: "fk_rails_9f3a02fe01", using: :btree

  create_table "users", force: :cascade do |t|
    t.string  "email",    limit: 255
    t.string  "password", limit: 255
    t.boolean "is_admin"
    t.integer "user_id",  limit: 4,   null: false
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree

  add_foreign_key "admins", "users"
  add_foreign_key "applications", "candidates"
  add_foreign_key "applications", "jobs"
  add_foreign_key "candidate_fields", "candidates"
  add_foreign_key "candidate_fields", "fields"
  add_foreign_key "job_fields", "fields"
  add_foreign_key "job_fields", "jobs"
  add_foreign_key "job_test_parameters", "jobs"
  add_foreign_key "question_statistics", "questions"
  add_foreign_key "questions", "fields"
  add_foreign_key "questions", "question_types"
  add_foreign_key "test_responses", "questions"
  add_foreign_key "test_responses", "tests"
  add_foreign_key "tests", "applications"
end

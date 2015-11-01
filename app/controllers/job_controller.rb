require 'job'
require 'field'
require 'job_field'

class JobController < ApplicationController
	# new
	# data [json]:
	# 	title [string]: job title
	#   description [string]:: job description
	#   experience [int]: experience level
	#   fields [array]:
	#     each element [string]: field token
	def new
		job = Job.new
		job_info = JSON.parse params[:data]
		job.title = job_info['title']
		job.description = job_info['description']
		job.experience = job_info['experience']
		job.save

		test_parameter = Hash.new
		test_parameter[:topics] = []
		byebug
		job_info['topics'].each do |field_info|
			field = Field.find_by! token: field_info['topic']
			JobField.create job_id: job.id, field_id: field.id

			field_test_parameter = Hash.new
			field_test_parameter[:topic] = field_info['topic']
			field_test_parameter[:count] = field_info['count']
			field_test_parameter[:difficulty] = field_info['difficulty']
			test_parameter[:topics] << field_test_parameter
		end

		job_test_parameter = JobTestParameter.new
		job_test_parameter.job_id = job.id
		job_test_parameter.descriptor = JSON.generate test_parameter
		job_test_parameter.save

		render :json => job
	end
	def get
		job = Job.find! params[:id]
		ret = Hash.new
		ret[:info] = job
		ret[:fields] = job.fields
		render :json => ret
	end
end

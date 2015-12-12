require 'job'
require 'field'
require 'job_field'

class JobController < ApplicationController
  @@LIMIT = 100
	# new
	# data [json]:
	# 	title [string]: job title
	#   description [string]:: job description
	#   experience [int]: experience level
	#   fields [array]:
	#     each element [string]: field token
	def new
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		job = Job.new
		job_test_info = JSON.parse params[:test_parameter]
		job.title = params[:title]
		job.description = params[:description]
		job.experience = params[:experience]
		job.save

		test_parameter = Hash.new
		test_parameter[:topics] = []
		job_test_info.each do |field_info|
			field = Field.find_by! token: field_info['topic']
			JobField.create job_id: job.id, field_id: field.id

			field_test_parameter = Hash.new
			field_test_parameter[:topic] = field_info['topic']
			field_test_parameter[:count] = field_info['count']
			field_test_parameter[:difficulty] = field_info['difficulty']
			field_test_parameter[:type] = field_info['type']
			test_parameter[:topics] << field_test_parameter
		end

		job_test_parameter = JobTestParameter.new
		job_test_parameter.job_id = job.id
		job_test_parameter.descriptor = JSON.generate test_parameter
		job_test_parameter.save

		render :json => job
	end
	def get
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
		job = Job.find params[:id]
    job_test_parameter = job.job_test_parameter
    job_test_parameter_descriptor = JSON.parse(job_test_parameter.descriptor)
    field_tokens = job_test_parameter_descriptor['topics'].map do |topic|
      topic['topic']
    end
    fields = {}
    Field.where(token: field_tokens).each do |field|
      fields[field.token] = field.name
    end
		render json: {
      info: job,
      fields: fields,
      test_parameter: JSON.parse(job_test_parameter.descriptor)
    }
	end
  def list
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
    render json: Job.offset(params[:start] || 0).limit(@@LIMIT)
  end
  def edit
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
    @id = params[:id]
  end
  def save
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
    job = Job.find params[:id]
    job_test_info = JSON.parse params[:test_parameter]
    job.title = params[:title]
    job.experience = params[:experience]
    job.description = params[:description]
    job.save

    old_fields = job.fields.map { |field| field.id }
    new_fields = Field.where(
      token: job_test_info['topics'].map { |topic|  topic['topic']})
      .map { |field| field.id }
    JobField.where(
      field_id: old_fields - new_fields,
      job_id: job.id
    ).destroy_all
    (new_fields - old_fields).map do |field|
      job_field = JobField.new
      job_field.job_id = job.id
      job_field.field_id = field
      job_field.save
    end

    job_test_parameter = job.job_test_parameter
    job_test_parameter.descriptor = params[:test_parameter]
    job_test_parameter.save

    render json: {status: 'success'}
  end
end

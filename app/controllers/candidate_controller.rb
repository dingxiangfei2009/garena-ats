require 'candidate'
require 'field'
require	'candidate_field'

class CandidateController < ApplicationController
	def new
		candidate = Candidate.find_by email: params[:email]
		if candidate
			render json: candidate
		elsif params[:email]
			candidate = Candidate.new
			candidate.email = params[:email]
			candidate.name = params[:name]
			candidate.first_name = params[:first_name]
			candidate.last_name = params[:last_name]
			candidate.description = params[:description]
			candidate.save
			if params[:fields]
				JSON.parse(params[:fields]).each do |token|
					field = Field.find_by token: token
					CandidateField.create(
						candidate_id: candidate.id,
						field_id: field.id) if field
				end
			end
			render json: candidate
		else
			raise 'email is empty'
		end
	end
end

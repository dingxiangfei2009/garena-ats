require 'application'
require 'candidate'

class ApplicationProfileController < ApplicationController
	def new
		apl = Application.new
		apl.candidate_id = params[:candidate_id]
		apl.job_id = params[:job_id]
		apl.save
		render json: apl
	end
end

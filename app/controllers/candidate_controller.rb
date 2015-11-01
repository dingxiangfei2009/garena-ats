require 'candidate'

class CandidateController < ApplicationController
	def new
		candidate = Candidate.new
		candidate.email = params[:email]
		candidate.name = params[:name]
		candidate.save
		render :json => candidate
	end
end

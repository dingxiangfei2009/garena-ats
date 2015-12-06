class PagesController < ApplicationController
  def home
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def jobs
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def position
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def applicants
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def candidate
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def question
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def questions
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def test
		reset_session
  end
  def register
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def login
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def available
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def tests
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
end

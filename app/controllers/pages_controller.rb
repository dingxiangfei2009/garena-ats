class PagesController < ApplicationController
  def home
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
  def topics
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def admin
		unless session[:user]
			redirect_to '/auth/google'
			return
		end
  end
  def question
  end
  def test
  end
  def register
  end
  def login
  end
end

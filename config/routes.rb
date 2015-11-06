Rails.application.routes.draw do

  get '/jobs', :to => 'pages#jobs'
  get '/candidate', :to => 'pages#candidate'
  get '/question', :to => 'pages#question'
  get '/test', :to => 'pages#test'
  get '/tests', :to => 'pages#tests'
  get '/register', :to => 'pages#register'
  get '/login', :to => 'pages#login'
  get '/available', :to => 'pages#available'
  scope '/question' do
    post '/query', to: 'question#list'
    scope '/:id' do
      get '/', to: 'question#get'
      post '/', to: 'question#save'
      post '/enable', to: 'question#enable'
      post '/disable', to: 'question#disable'
    end
    post '/', to: 'question#new'
  end
  scope '/test' do
    scope '/:id' do
      get '/', to: 'test#get'
      post '/', to: 'test#save'
      post '/evaluate', to: 'test#save_evaluation'
    end
    post '/', to: 'test#new'
  end
  scope '/job' do
    scope '/:id' do
      get '/', to: 'job#get'
    end
    post '/', to: 'job#new'
    get '/', to: 'pages#job'
  end
  scope '/applicants' do
    get '/', :to => 'pages#applicants'
    post '/', to: 'candidate#new'
    scope '/:candidate_id' do
      scope '/job' do
        post '/:job_id', to: 'application_profile#new'
      end
    end
  end
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end

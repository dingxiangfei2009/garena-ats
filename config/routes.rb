Rails.application.routes.draw do
  scope '/auth' do
    get '/google/callback', to: 'auth#auth'
    get '/redirect', to: 'auth#redirect'
    get '/fail', to: 'auth#fail'
    get '/logout', to: 'auth#destroy'
  end

  root 'pages#home'

  get '/home', :to => 'pages#home'
  get '/position', :to => 'pages#position'
  get '/jobs', :to => 'pages#jobs'
  get '/candidate', :to => 'pages#candidate'
  get '/question', :to => 'pages#question'
  get '/questions', :to => 'pages#questions'
  get '/test', :to => 'pages#test'
  get '/tests', :to => 'pages#tests'
  get '/register', :to => 'pages#register'
  get '/topics', :to => 'pages#topics'
  get '/login', :to => 'pages#login'
  get '/available', :to => 'pages#available'
  scope '/question' do
    post '/query', to: 'question#list'
    scope '/:id' do
      get '/', to: 'question#get'
      post '/', to: 'question#save'
      post '/enable', to: 'question#enable'
      post '/disable', to: 'question#disable'
      get '/report', to: 'question#statistics'
    end
    post '/', to: 'question#new'
  end
  scope '/test' do
    get '/query', to: 'test#list'
    scope '/:id' do
      get '/', to: 'test#get'
      post '/', to: 'test#save'
      post '/evaluate', to: 'test#save_evaluation'
      get '/report', to: 'test#statistics'
    end
    post '/', to: 'test#new'
  end
  scope '/job' do
    scope '/:id' do
      get '/', to: 'job#get'
      get '/edit', to: 'job#edit'
      post '/edit', to: 'job#save'
      post '/delete', to: 'job#destroy'
    end
    post '/', to: 'job#new'
    get '/', to: 'job#list'
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
  scope '/evaluate' do
    scope '/:id' do
      get '/', to: 'evaluate#evaluate'
      post '/', to: 'evaluate#save'
    end
  end
  scope '/topics' do
    get '/all', to: 'topics#all'
    post '/new', to: 'topics#new'
    post '/update', to: 'topics#update'
    post '/destroy', to: 'topics#destroy'
  end
  scope '/admins' do
    get '/', to: 'edit_admin#list'
    get '/all', to: 'edit_admin#all'
    post '/new', to: 'edit_admin#new'
    post '/destroy', to: 'edit_admin#destroy'
    post '/update', to: 'edit_admin#update'
  end
  scope '/question_types' do
    get '/', to: 'question_type#list'
    post '/', to: 'question_type#save'
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

Rails.application.config.middleware.use OmniAuth::Builder do
  provider OmniAuth::Strategies::GoogleOauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'],
    name: 'google',
    scope: 'email, profile',
    prompt: 'select_account'
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_auth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'],
    name: 'google',
    scope: 'email, profile',
    prompt: 'select_account'
end

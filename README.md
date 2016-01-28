### Instruction
To set up, install the necessary softwares
* MySQL(Mariadb), Ruby, Gems, Bundler, Node.js and Bower

  `sudo apt-get install ruby rubygems ruby-dev npm mariadb-server`  
  `sudo gem install bundle`  
  `sudo npm install -g bower`

* Set up extra software from Bundler and Bower

  `bundle install`
  `npm install`  
  `bower install`

* Set up database
  In `/config/database.yml`, fill in the fields `username` and `password`.  
  Production environment will be used, so in mysql console create a database
  `garena_ats`. Grant necessary priviledges to the user for creating and altering
  schema. Then execute database migration.

  `rake db:migrate RAILS_ENV=production`  
  `rake db:populate RAILS_ENV=production`

* Set up Google API access and Session Secret
  Use `/config/application.yml.sample` as a template to create
  `/config/application.yml.sample`. Open Google Developer Console and enable
  Contacts and Google+ APIs. Then generate access tokens and put them in the
  `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` fields in the `default` section.

  Also in `/config/application.yml`, put down a secret string of at least 30
  characters in the `SECRET_KEY_BASE` fields.

* Add initial admin account
  Use mysql console to insert an initial admin Google email address into the table `admins`.
  Sample SQL:

  `insert into admins (email) values (?);`

* Start Up, Log In and Add admins
  Extra set up to get UI working:  
  `gulp`
  `RAILS_ENV=production rake assets:precompile`
  To start the server:  
  `rails s -e production`

  Default port is 3000. Go to `/admins` and add more admin Google email addresses.

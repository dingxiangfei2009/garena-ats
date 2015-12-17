FROM ubuntu
RUN apt-get update
RUN apt-get install -y rubygems-integration mariadb-server nodejs npm ruby-dev build-essential
RUN /bin/bash -l -c "gem install bundle"
RUN /bin/bash -l -c "npm install -g bower"
ADD ./ /ats
WORKDIR /ats
RUN /bin/bash -l -c "bundle install"
RUN /bin/bash -l -c "bower install"
RUN /bin/bash -l -c "RAILS_ENV=production rake db:migrate"
RUN /bin/bash -l -c "RAILS_ENV=production rake db:populate"
EXPOSE 3000
ENTRYPOINT "rails s -e production"

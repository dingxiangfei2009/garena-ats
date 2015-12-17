FROM rails:onbuild
RUN apt-get update
RUN apt-get install -y nodejs npm
RUN npm install -g bower
WORKDIR /usr/src/app
RUN bower install
RUN /bin/bash -l -c "RAILS_ENV=production rake db:migrate"
RUN /bin/bash -l -c "RAILS_ENV=production rake db:populate"
# ADD ./ /ats
# RUN /bin/bash -l -c "bundle install"
# RUN /bin/bash -l -c "bower install"
# EXPOSE 3000
# ENTRYPOINT "rails s -e production"

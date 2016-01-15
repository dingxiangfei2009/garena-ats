FROM rails:onbuild
RUN apt-get update
RUN apt-get install -y nodejs npm
RUN npm install -g bower
WORKDIR /usr/src/app
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN bower install --allow-root
RUN rm -rf /usr/src/app
#RUN RAILS_ENV=production rake assets:precompile
CMD ["rails", "server", "-b", "0.0.0.0", "-e" , "production"]

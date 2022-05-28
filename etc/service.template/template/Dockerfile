# Dockerfile for production image for {{serviceName}} service of the MyApp services backend.
#
# Copyright MyCompany. All rights reserved.

# Our builder stage
FROM node:16-buster-slim AS builder
# Add maintainer info
LABEL maintainer="MyApp"

# Our package name
ARG package
ARG category
RUN echo building first stage image for package ${package}

# Install build tools
RUN apt-get update && \
  apt-get -y install node-gyp python sudo

# Create user "my-app" with sudo powers
RUN sed -e 's/%sudo	ALL=(ALL:ALL) ALL/%sudo	ALL=(ALL) NOPASSWD: ALL/g' -i /etc/sudoers
RUN useradd -m my-app && \
  usermod -aG sudo my-app && \
  touch /home/my-app/.bashrc && \
  chown -R my-app:my-app /home/my-app

# Install postgresql
RUN apt update && apt -y install gnupg2 wget \
  && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \ 
  && echo "deb http://apt.postgresql.org/pub/repos/apt/ $(cat /etc/os-release | grep VERSION_CODENAME | awk -F= '{print $2}')-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list \ 
  && apt update && apt -y install postgresql-12 postgresql-client-12 \ 
  && sed -i "s/peer\|md5/trust/g" /etc/postgresql/12/main/pg_hba.conf \ 
  && sed -i "/wal_level/c\wal_level = logical" /etc/postgresql/12/main/postgresql.conf \
  && echo "en_US.utf8 UTF-8" >> /etc/locale.gen \
  && locale-gen

# Set the working directory
WORKDIR /home/my-app/${package}
# Copy our monorepo over
COPY . .
# Fix permissions
RUN chown -R my-app:my-app .

# Run things as my-app user
USER my-app

# Install rush
RUN node common/scripts/install-run-rush.js install --to ${package}

# Create a test env file
RUN cp packages/${category}/${package}/envs/example.docker.test.env packages/${category}/${package}/envs/local.test.env

USER postgres

RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER {{serviceName}} WITH SUPERUSER PASSWORD 'dbpass';" &&\
    createdb -O {{serviceName}} {{serviceName}}

USER my-app
RUN cd packages/${category}/${package} \
  && sudo service postgresql start \
  && npm run test:start \
  && npm run cli-test:start \
  && cd -

# Build
RUN node common/scripts/install-run-rush.js build --to ${package}
# Create deployment package
RUN node common/scripts/install-run-rush.js deploy -p @my-app/${package}
# Tar/gzip to maintain links
RUN tar cvzf deploy.tar.gz common/deploy

# Our final image
FROM node:16-buster-slim
# Add maintainer info
LABEL maintainer="MyApp"

# Our package name
ARG package
ARG category
RUN echo building final stage image for package ${category}/${package}

# Install required system packages and dependencies
RUN apt-get update && apt-get upgrade -y && \
  apt-get install -y iproute2 iputils-ping sudo procps && \
  apt-get -y autoremove && \
  rm -r /var/lib/apt/lists /var/cache/apt/archives

# Create user "my-app" with sudo powers
RUN sed -e 's/%sudo	ALL=(ALL:ALL) ALL/%sudo	ALL=(ALL) NOPASSWD: ALL/g' -i /etc/sudoers
RUN useradd -m my-app && \
  usermod -aG sudo my-app && \
  touch /home/my-app/.bashrc && \
  chown -R my-app:my-app /home/my-app
# Set the working directory
WORKDIR /home/my-app/${package}

# Copy deployment folder tar/gzip from builder
COPY --from=builder --chown=my-app:my-app /home/my-app/${package}/deploy.tar.gz .
RUN tar --strip-components=1 -xvzf deploy.tar.gz && rm deploy.tar.gz
RUN chown -R my-app:my-app /home/my-app

# Run things as my-app user
USER my-app

# Set the new working directory
WORKDIR /home/my-app/${package}/deploy/packages/${category}/${package}

# Our run command
CMD ["npm", "run", "start"]

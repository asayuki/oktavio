# Octav.io

## General Requirements

* NodeJS => 4
* npm => 2.14.7
* git
* mongodb-server (local or remote)
* redis-server (local or remote)

## Configuring

`Octav.io` configuration comes from environment variables. Some of them might work with default-values, others need to be configurated. Copy .env.example to .env and make your configurations there.

* `APP_HOST` - Defaults to 127.0.0.1
* `APP_PORT` - Defaults to 8000
* `APP_PRODUCTION` - Defaults to false, will output logs in console if not set to true
* `SESSION_PRIVATE_KEY` - Required; Key for session/cookies/tokens
* `REDIS_HOST` - Defaults to 127.0.0.1
* `REDIS_PORT` - Defaults to 6379
* `REDIS_PASSWORD` - Defaults to null, might be required
* `REDIS_PARTITION` - Required; Redis partition
* `MONGO_HOST` - Defaults to 127.0.0.1
* `MONGO_PORT` - Defaults to 27017
* `MONGO_USER` - Defaults to null, might be required
* `MONGO_PASSWORD` - Defaults to null, might be required
* `MONGO_DB` - Required; Mongo database
* `PILIGHT_HOST` - Required (if `PILIGHT_DONTLOAD` is not set to true); Address to Pilight Daemon
* `PILIGHT_PORT` - Required (if `PILIGHT_DONTLOAD` is not set to true); Port to Pilight Daemon

### Additional configurations

* `TEST_USER` - Optional; For testing purpose
* `TEST_PASSWORD` - Optional; For testing purpose
* `PILIGHT_DONTLOAD` - Optional; For testing purpose, if you dont have access to any pilight daemons

## Install packages

To install node packages required to run the application, other than general requirements, execute the following command in the project root.

``npm install``

> Note: Sometimes there is an issue with permissions and you might need to use sudo.

## Adding initial user

## Starting Octav.io

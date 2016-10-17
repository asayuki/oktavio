![Oktav.IO](oktavio.png)
# Oktav.IO

## General Requirements

* Node.JS
* NPM
* MongoDB
* Redis
* pilight-daemon

## Setup Oktav.IO

### Configuration

Copy .env.example to .env and make your configurations there.

**Oktav.IO Application**

* **`HOST`** - Defaults to OS hostname, or `localhost`.
* **`PORT`** - Defaults to random.
* **`COOKIE_HASH`** - _(Required)_ 32-char long hash for cookies
* **`COOKIE_NAME`** - _(Required)_ Name for chookie

**Redis**

* **`REDIS_HOST`** - Defaults to `127.0.0.1`
* **`REDIS_PORT`** - Defaults to
* **`REDIS_PASSWORD`** - Defaults to `null`
* **`REDIS_PARTITION`** - _(Required)_

**MongoDB**

* **`MONGO_URL`** - _(Required)_ For example: `mongodb://127.0.0.1:27017/` (dont forget the trailing slash)
* **`MONGO_DB`** - _(Required)_
* **`MONGO_USER`** - Defaults to `null`
* **`MONGO_PASS`** - Defaults to `null`

**Pilight**

* **`PILIGHT_SKIP`** - Defaults to `false`
* **`PILIGHT_HOST`** - _(Required, if skip is not set to True)_
* **`PILIGHT_PORT`** - _(Required, if skip is not set to True)_

**Additional configurations**

* **`SKIP_DOTENV`** - Skip loading .env-file
* **`TESTING`** - Used by tests
* **`COMMENCE_TESTING`** - Used by tests

### Install packages

To install node packages required to run the application, other than general requirements, execute the following command in the project root.

`npm install`

### Add initial User

You wont get far unless you have an account that can login and add/update/delete stuff. Whilst logged in you can create more users.

```
node bin/createUser
```

### Starting

`npm start` will start the application but will also exit the application if you close your terminal window.

A good way to start applications and keeping them alive is to use [PM2](https://github.com/Unitech/pm2). Follow the installation guide and then run ``pm2 start oktavio.js``.

## API

### Users

* [<code>POST</code> /api/users/login](documentation/users/POST_users_login.md)
* [<code>GET</code> /api/users/logout](documentation/users/GET_users_logout.md)
* [<code>POST</code> /api/users](documentation/users/POST_users.md)
* [<code>PUT</code> /api/users](documentation/users/PUT_users.md)
* [<code>DELETE</code> /api/users](documentation/users/DELETE_users.md)
* [<code>GET</code> /api/users](documentation/users/GET_users.md)
* [<code>GET</code> /api/users/:id](documentation/users/GET_users_id.md)

### Devices

* [<code>POST</code> /api/devices](documentation/devices/POST_devices.md)
* [<code>PUT</code> /api/devices](documentation/devices/PUT_devices.md)
* [<code>GET</code> /api/devices](documentation/devices/GET_devices.md)
* [<code>GET</code> /api/devices/{id}](documentation/devices/GET_devices_id.md)
* [<code>DELETE</code> /api/devices](documentation/devices/DELETE_devices.md)
* [<code>POST</code> /api/devices/{id}/activate](documentation/devices/POST_device_activate.md)
* [<code>POST</code> /api/devices/{id}/deactivate](documentation/devices/POST_device_deactivate.md)

### Modes

* [<code>POST</code> /api/modes](documentation/modes/POST_modes.md)
* [<code>PUT</code> /api/modes](documentation/modes/PUT_modes.md)
* [<code>GET</code> /api/modes](documentation/modes/GET_modes.md)
* [<code>GET</code> /api/modes/{id}](documentation/modes/GET_modes_id.md)
* [<code>DELETE</code> /api/modes](documentation/modes/DELETE_modes.md)
* [<code>POST</code> /api/modes/{id}/activate](documentation/modes/POST_modes_activate.md)

### Schedules

* [<code>POST</code> /api/schedules](documentation/schedules/POST_schedules.md)
* [<code>PUT</code> /api/schedules](documentation/schedules/PUT_schedules.md)
* [<code>GET</code> /api/schedules](documentation/schedules/GET_schedules.md)
* [<code>GET</code> /api/schedules/{id}](documentation/schedules/GET_schedules_id.md)
* [<code>DELETE</code> /api/schedules](documentation/schedules/DELETE_schedules.md)

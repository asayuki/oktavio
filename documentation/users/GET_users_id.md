# User resources

    GET /api/users/:id

## Description

Get a user

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Return format

A JSON object which holds a object called `user` which then contains all user-data, minus password:

- **_id** — ObjectID
- **username** — String
- **email** — String

## Errors

- **500**
- **400**

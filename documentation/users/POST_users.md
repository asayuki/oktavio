# User resources

    POST /api/users

## Description

Creates a user that is able to use the whole API

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **username** _(required)_
- **email** _(required)_
- **password** _(required)_

## Return format

A JSON object with key:

- **userCreated**
- **userId**

## Errors

- **500**
- **400**

# User resources

    PUT /api/users

## Description

Updates a user

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **id** _(required)_
- **username**
- **email**
- **password**

## Return format

A JSON object with key:

- **userUpdated**

## Errors

- **500**
- **400**

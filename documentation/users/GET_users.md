# User resources

    GET /api/users

## Description

Get a list of users

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters (Query)

- **limit** — Number of total users to get
- **from** — User (_id) to start the query from

## Return format

A JSON array called `users` which holds all User-objects

- **users** — Array

## Errors

- **500**
- **400**

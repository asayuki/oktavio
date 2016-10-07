# Mode resources

    GET /api/modes/:id

## Description

Get a mode

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Return format

A JSON object which holds a object called `mode` which then contains all mode-data:

- **_id** — ObjectID
- **devices** — Array

## Errors

- **500**
- **400**

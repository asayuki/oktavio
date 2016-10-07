# Device resources

    GET /api/devices/:id

## Description

Get a device

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Return format

A JSON object which holds a object called `device` which then contains all device-data:

- **_id** — ObjectID
- **name** — String
- **protocol** — String
- **unit_code** — Integer
- **unit_id** — Integer
- **state** — Boolean

## Errors

- **500**
- **400**

# Device resources

    PUT /api/devices

## Description

Updates a device

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **id** — String _(required)_
- **name** — String
- **protocol** — String
- **unit_code** — Integer
- **unit_id** — Integer
- **state** — Boolean

## Return format

A JSON object with key:

- **deviceUpdated**

## Errors

- **500**
- **400**

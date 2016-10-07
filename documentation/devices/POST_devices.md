# Device resources

    POST /api/devices

## Description

Creates a device

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **name** — String _(required)_
- **protocol** — String _(required)_
- **unit_code** — Integer _(required)_
- **unit_id** — Integer _(required)_
- **state** — Boolean _(required)_

## Return format

A JSON object with key:

- **deviceCreated**
- **deviceId**

## Errors

- **500**
- **400**

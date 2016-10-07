# Mode resources

    POST /api/mode

## Description

Update a mode

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **id** — String _(required)_
- **name** — String
- **devices** — Array
* - **id** — ObjectID _(Device id)_
* - **state** — Boolean _(What state the device should have when this mode is active)_

## Return format

A JSON object with key:

- **modeUpdated**

## Errors

- **500**
- **400**

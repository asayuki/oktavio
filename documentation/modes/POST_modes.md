# Mode resources

    POST /api/mode

## Description

Creates a mode

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **name** — String _(required)_
- **devices** — Array _(required)_
* - **id** — ObjectID _(Device id)_
* - **state** — Boolean _(What state the device should have when this mode is active)_

## Return format

A JSON object with key:

- **modeCreated**
- **modeId**

## Errors

- **500**
- **400**

# Schedule resources

    POST /api/schedule

## Description

Creates a schedule

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **weekDay** — String _(required)_ _(`all`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday` and `sunday` are valid weekdays.)_
- **time** — Integer _(required)_
- **type** — String _(required)_ _(`device` and `mode` are valid types)_
- **typeId** — String/ObjectID _(required)_
- **state** — Boolean _(required (only if type is `device`))_

## Return format

A JSON object with key:

- **scheduleCreated**
- **scheduleId**

## Errors

- **500**
- **400**

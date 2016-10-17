# Schedule resources

    PUT /api/schedule

## Description

Update a schedule

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters

- **id** — String _(required)_
- **weekDay** — String _(`all`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday` and `sunday` are valid weekdays.)_
- **time** — Integer
- **type** — String _(`device` and `mode` are valid types)_
- **typeId** — String/ObjectID
- **state** — Boolean _(required (only if type is `device`))_

## Return format

A JSON object with key:

- **scheduleUpdated**

## Errors

- **500**
- **400**

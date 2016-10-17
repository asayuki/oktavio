# Schedule resources

    GET /api/schedules/:id

## Description

Get a schedule

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Return format

A JSON object which holds a object called `schedule` which then contains all Schedule-data:

- **_id** — ObjectID
- **weekDay** — String
- **time** — Integer
- **type** — String
- **typeId** — String
- **state** — Boolean

## Errors

- **500**
- **400**

# Schedule resources

    GET /api/schedules

## Description

Get a list of schedules

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters (Query)

- **limit** — Number of total users to get
- **from** — Schedule (_id) to start the query from

## Return format

A JSON array called `schedules` which holds all Schedule-objects

- **schedules** — Array

## Errors

- **500**
- **400**

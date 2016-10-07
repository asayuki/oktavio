# Device resources

    GET /api/devices

## Description

Get a list of devices

## Requires authentication

* A valid session
* (Not implemented yet) A valid JWT

***

## Parameters (Query)

- **limit** — Number of total users to get
- **from** — User (_id) to start the query from

## Return format

A JSON array called `devices` which holds all Device-objects

- **devices** — Array

## Errors

- **500**
- **400**

# Project World Texting Foundation

The purpose of this project is to demonstrate creating a NodeJS server using
modern best practices for API development.

This is a very simple REST API for the World Texting Foundation, also known as WTF.
It allows searching and managing acronym definitions.

## Requirements and running from Docker

1. [Install Docker Compose](https://docs.docker.com/compose/install/)
2. Run container with `docker-compose up` from console
3. After a message is visible from the console terminal: Listening on port 3001,
   application could be tested with any REST API client, eg.:
   http://localhost:3001/acronym?from=0&limit=10&search=IC

   There should be json string with 10 object entries listed with their
   names and definitions.

   Header would contain:
   Pagination-Total-Records: 23 and
   Pagination-More-Results-Exists: true.

## Authentication

For correct authentication, in the header should be added: Authentication:secretword

Password 'secretword' is hardcoded into application.

Example with httpie API client:
$ http DELETE http://localhost:3001/acronym/MT Authentication:secretword

## Available Scripts for developers

### Running the project

    $ npm start

### Running the project with watching changes

    $ npm start-dev

### Testing

    $ npm test

### Linting

    $ npm lint

### Prettier

    $ npm prettier

## Project Structure

This application is structured by the components. Currently, we have only one component "acronym",
which has all related files put into one folder: routes, model, service, etc.

That way we have each unit of the project, small, simple, and isolated. So we are not afraid
to add new features in the future and to break other components. Also, it would be easier to
scale out, since all business units are separated.

### components

Components will try to resemble Hexagonal architecture style (it is far away from complete
Hexagonal architecture, as it would be overkill for this project) in terms that we have outer
ring with Routes - that depends on Express server, and as we go further to the inner rings,
we have fewer infrastructure dependencies.

Routes file has all web-related parts, matching route, parsing parameters, validating parameters.

Routes also contain APIDOC comments, allowing the generation of nice API documentation.

Service is where all business logic resides, and it will use a Model to do database-related tasks,
and at the end, it will return data to the server, which will assemble a response object.
That way, in the future it will be also easier to test Service without going through Express
server.

When the complexity arises, we will refactor database queries from Service into the new Repository
file.

- components/
  | - acronyms
  index.js - public API
  acronymRoutes.js
  acronymService.js
  acronymModel.js
  acronymTest.js

### data

The data folder contains data files for our application. It contains acronym.json and wtf.sqlite files.
It should have writable permissions.

For a 12-factor application, we should use Mysql or some other database, which resides outside our
application container.

## Configuration

The project uses rc library which provides very flexible configuration methods.

In the configuration file we provide:

- port
- database credentials

By default options are configured inside .wtfrc file. We can also pass them by command line parameters,
or using env variables.

Command-line example
--PORT 3001

ENV example
wtf_PORT=3001

## DB cli tools

### Running migrations

    $ npx sequelize-cli db:migrate

### Undoing migrations

    $ npx sequelize-cli db:migrate:undo:all

### Running seeds

    $ npx sequelize-cli db:seed:all

### Undoing seeds

    $ npx sequelize-cli db:seed:undo:all

## Assumptions about input parameters

Parameters: 'from', 'limit' and 'search' are optional.
Also :search and :acronym query parameters should be url encoded.
Like %3C3 for &lt;3

Fuzzy matching search is implemented using the basic SQL 'like' statement
with wildcards, eg.: WHERE `Acronym`.`name` LIKE '%AIR%'

## Limitations

Some acronyms are the same but have different definitions.
PUT /acronym/:acronym and DELETE /acronym/:acronym will only affect the first
found record.
# wetefe

# micro-service-template

moleculer template for backend microservices

## What is this?

This is a moleculer template for micro-services. This will provide a functional service along with required packages and tooling to build a micro-service for the cloud backend.

## Prerequisites

- Install Node.js (version 12 or higher) and npm.
- Install moleculer comman line interface `sudo npm install -g moleculer-cli`

## Create new service:

1. Create new service code via moleculer-cli:

```sh
moleculer init --no-install "etc/service.template" packages/services/<SERVICE_NAME>
```

## Development of new service

You have 2 options for development:

1. Run service on host OS - can be faster but you will be only able to run tests (no dev mode runtime)
2. Run service in container.

! Imporant:

- If you made `npm install` from host OS and you want to work inside container then remove node_modules direcory and install it again from inside container. The same for opposite scenario.

### 1. Run service on host OS:

Prerequisites:

Windows: - `npm i -g windows-build-tools` via admin powershell

Linux: - `apk add --no-cache make gcc g++ python git`

- `npm install` from `micro-<SERVICE_NAME>` dir. If failed try multiple times.
- `npm test` to run tests

### 2. Run inside container:

Prerequisites:

- After you've created new `.yml` file via `sh add-new-service.sh <SERIVCE_NAME>` you should have running container for your new service. Call `sh up.sh`

Steps:

- go into container. From `micro-<SERVICE_NAME>` dir call:
- `sh enter-container`
- `npm install`
- `npm test` to run tests
- `npm run dev` to run service in development environment with interactive [moleculer-cli](https://moleculer.services/docs/0.14/moleculer-cli.html).

## Rules

- Services need to be written in TypeScript.
- 100% unit test coverage is expected.
- Run `npm run lint` and fix any issues before checking in.
- Format your code ``npm run format`. There should be _NO_ comments in code reviews about format issues.

## Production deployment

There is a Dockerfile that will generate a production ready docker image:

`docker build -t "my-app/<service>:latest" .`

## For developer of micro-{{serviceName}}

- Do not modify `src/lib` - it is readonly
- Do not modify filenames or export names of (files used by `src/lib`):
  - `api/index.ts`
  - `env.schema.ts`
  - `service.types.ts`
- Server framework - [moleculer](https://moleculer.services/) + TypeScript overlay libs
- DB framework - [mikro-orm](https://mikro-orm.io/)
- Data Validation (config and payloads) - [joiful](https://github.com/joiful-ts/joiful).
- Don't try to put `index.ts` inside `src/lib` (briefly - you may end up with undefined dependencies at runtime).

Feel free to update above list.

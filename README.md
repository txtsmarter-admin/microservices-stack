# What is this?

This is a template for building a microservices based SAAS platform with the following components:

- moleculer microservices framework
- RabbitMQ for messaging
- Mongo/Postgres for data store
- Mikro-ORM for database access layer
- CASL for permissioning
- GraphQL for API gateway

# Setup

Install monorepo manager:

```
npm install -g @microsoft/rush
```

or

```
pnpm add -g @microsoft/rush
```

Install dependencies

```
rush install
```

Update packages and rebuild.

```
rush update --full
rush update --full --purge
```

Format

```
rush format
```

Lint

```
rush lint
```

Build

```
rush build
```

or

```
rush rebuild
```

Test

```
rush test --verbose
```

Check dependencies of each package.

```
rush check
```

# Custom commands

Open `common/config/command-line.json` and add a custom command.

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/rush/v5/command-line.schema.json",
  "commands": [
    {
      "commandKind": "bulk",
      "name": "test",
      "summary": "Test packages.",
      "description": "Executes automated tests.",
      "enableParallelism": true
    }
  ],
  "parameters": []
}
```

You can now run `rush test` to run it.

# What is this?

This is a template for building a microservices based SAAS platform with the following components:

- [moleculer](https://moleculer.services) microservices framework
- [RabbitMQ](https://www.rabbitmq.com) for messaging
- Mongo/Postgres for data store
- [Mikro-ORM](https://mikro-orm.io) for database access layer
- [CASL](https://casl.js.org/v5/en) for authorization/permissioning
- [TypeGraphQL](https://typegraphql.com) for API gateway

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

# Format

```
rush format
```

# Lint

```
rush lint
```

# Build

```
rush build
```

or

```
rush rebuild
```

# Test

```
rush test --verbose
```

# Dependency management

Check mismatched dependencies across packages

```
rush check
```

# Update all dependencies

```
etc/update.deps.sh -u
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

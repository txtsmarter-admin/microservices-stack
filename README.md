# What is this?

This is a template for building a microservices based SAAS platform with the following components:

- moleculer microservices framework
- RabbitMQ for messaging
- Mongo/Postgres for data store
- Mikro-ORM for database access layer
- CASL for permissioning
- GraphQL for API gateway

# Commands

Install monorepo manager:

```
npm install -g @microsoft/rush
```

Initialize the project:

```
$ rush init
```

Update packages and rebuild.

```
$ rush update --full
$ rush update --full --purge
$ rush rebuild
```

Publish to NPM:

```
$ rush version --bump --override-bump minor
$ rush publish --publish --include-all
```

Check dependencies of each package.

```
$ rush check
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

# Publish policy

Open `common/config/version-policies.json` and add a policy.

```json
[
  {
    "policyName": "framework",
    "definitionName": "lockStepVersion",
    "version": "1.3.2",
    "nextBump": "patch"
  }
]
```

Open `rush.json` and attach this policy to each package.

```json
{
   "projects": [
    {
      "packageName": "@xtest/sandbox",
      "projectFolder": "packages/xtest-sandbox",
      "versionPolicyName": "framework"
    }
    ...
   ],
}
```

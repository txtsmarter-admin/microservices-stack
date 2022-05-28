"use strict";

var fs = require("fs");
var path = require("path");

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.substring(1);
}

module.exports = function (values) {
  return {
    questions: [
      {
        type: "confirm",
        name: "needDb",
        message: "Does your service need to access its private database",
        default: true,
      },
      {
        type: "list",
        name: "db",
        message: "Select a db",
        choices: [
          {
            name: "sql",
            value: "sql",
          },
          {
            name: "mongo",
            value: "mongo",
          },
        ],
        when(answers) {
          return answers.needDb;
        },
        default: "sql",
      },
      {
        type: "confirm",
        name: "mongoTransactions",
        message: "Does your mongo instance support transactions?",
        default: false,
        when(answers) {
          return answers.db === "mongo";
        },
      },
    ],
    metalsmith: {
      before(metalsmith) {
        const projectName = metalsmith._metadata.projectName;

        const serviceName = projectName.replace(/^.*[\\\/]/, "");

        const dbPort = Math.floor(1000 + Math.random() * 9000);

        const capitalizedCamelCaseServiceName = serviceName
          .split(/[_-]/)
          .map(capitalize)
          .join("");

        metalsmith._metadata.serviceName = serviceName;
        metalsmith._metadata.capitalizedCamelCaseServiceName =
          capitalizedCamelCaseServiceName;
        metalsmith._metadata.dbPort = dbPort;
        // if we are using a database, set the appropriate database flag to true since handlebars can't compare values without helpers
        if (metalsmith._metadata.needDb) {
          const dbType = metalsmith._metadata.db;
          metalsmith._metadata[dbType] = true;
        }
        if (metalsmith._metadata.db === "sql") {
          metalsmith._metadata.externalSqlDb = true;
        }
      },

      complete(metalsmith) {
        // rename some files
        const projectPath = metalsmith._metadata.projectPath;
        const serviceName = metalsmith._metadata.serviceName;

        let oldFileName;
        let newFileName;

        oldFileName = `${projectPath}${path.sep}package-service.json`;
        newFileName = `${projectPath}${path.sep}package.json`;
        fs.renameSync(oldFileName, newFileName);

        oldFileName = `${projectPath}${path.sep}src${path.sep}SERVICE_NAME.service.ts`;
        newFileName = `${projectPath}${path.sep}src${path.sep}${serviceName}.service.ts`;
        fs.renameSync(oldFileName, newFileName);

        oldFileName = `${projectPath}${path.sep}tests${path.sep}SERVICE_NAME.service.spec.ts`;
        newFileName = `${projectPath}${path.sep}tests${path.sep}${serviceName}.service.spec.ts`;
        fs.renameSync(oldFileName, newFileName);

        oldFileName = `${projectPath}${path.sep}envs${path.sep}example.dev.env`;
        newFileName = `${projectPath}${path.sep}envs${path.sep}local.dev.env`;
        fs.copyFileSync(oldFileName, newFileName);

        oldFileName = `${projectPath}${path.sep}envs${path.sep}example.test.env`;
        newFileName = `${projectPath}${path.sep}envs${path.sep}local.test.env`;
        fs.copyFileSync(oldFileName, newFileName);

        if (metalsmith._metadata.db !== "sql") {
          fs.rmSync(`${projectPath}${path.sep}tests${path.sep}db`, {
            recursive: true,
          });
          fs.unlinkSync(`${projectPath}${path.sep}Dockerfile`);
        }

        // if we don't need any database, delete any database specific stuff
        if (!metalsmith._metadata.needDb) {
          const entitiesDir = `${projectPath}${path.sep}src${path.sep}entities`;
          fs.rmSync(entitiesDir, {
            recursive: true,
          });

          const addTestEntityParamsFile = `${projectPath}${path.sep}src${path.sep}api${path.sep}params${path.sep}add.test.entity.params.ts`;
          fs.unlinkSync(addTestEntityParamsFile);
          const editTestEntityParamsFile = `${projectPath}${path.sep}src${path.sep}api${path.sep}params${path.sep}edit.test.entity.params.ts`;
          fs.unlinkSync(editTestEntityParamsFile);
          const addTestEntityActionFile = `${projectPath}${path.sep}src${path.sep}action.handlers${path.sep}add.test.entity.ts`;
          fs.unlinkSync(addTestEntityActionFile);
          const editTestEntityActionFile = `${projectPath}${path.sep}src${path.sep}action.handlers${path.sep}edit.test.entity.ts`;
          fs.unlinkSync(editTestEntityActionFile);
          const dbConnectorFile = `${projectPath}${path.sep}src${path.sep}db.connector.ts`;
          fs.unlinkSync(dbConnectorFile);
          const dbConnectorSpecFile = `${projectPath}${path.sep}tests${path.sep}db.connector.spec.ts`;
          fs.unlinkSync(dbConnectorSpecFile);
          const utilsFile = `${projectPath}${path.sep}tests${path.sep}utils.ts`;
          fs.unlinkSync(utilsFile);
          const middleWareDbFile = `${projectPath}${path.sep}src${path.sep}middlewares${path.sep}moleculer.db.middleware.ts`;
          fs.unlinkSync(middleWareDbFile);
          const middleWareDbSpecFile = `${projectPath}${path.sep}tests${path.sep}middlewares${path.sep}moleculer.db.middleware.spec.ts`;
          fs.unlinkSync(middleWareDbSpecFile);
          const namingStrategyFile = `${projectPath}${path.sep}src${path.sep}mikro.orm.naming.strategy.ts`;
          fs.unlinkSync(namingStrategyFile);
          const namingStrategySpecFile = `${projectPath}${path.sep}tests${path.sep}mikro.orm.naming.strategy.spec.ts`;
          fs.unlinkSync(namingStrategySpecFile);
        }

        // TODO add deployment files (docker-compose.yml, deploy.gcloud.env, docker-compose.ci.tests.yml)

        // pull out the api into a separate project
        const oldApiPath = `${projectPath}${path.sep}src${path.sep}api`;
        const newApiPath = `${projectPath}${path.sep}..${path.sep}..${path.sep}api${path.sep}${serviceName}`;
        fs.mkdirSync(newApiPath);
        fs.renameSync(
          `${oldApiPath}${path.sep}params`,
          `${newApiPath}${path.sep}params`
        );
        fs.renameSync(
          `${oldApiPath}${path.sep}events`,
          `${newApiPath}${path.sep}events`
        );
        fs.renameSync(
          `${oldApiPath}${path.sep}index.ts`,
          `${newApiPath}${path.sep}index.ts`
        );
        fs.renameSync(
          `${projectPath}${path.sep}package-api.json`,
          `${newApiPath}${path.sep}package.json`
        );
        fs.renameSync(
          `${projectPath}${path.sep}.eslintignore`,
          `${newApiPath}${path.sep}.eslintignore`
        );
        fs.copyFileSync(
          `${projectPath}${path.sep}tsconfig.json`,
          `${newApiPath}${path.sep}tsconfig.json`
        );
        fs.copyFileSync(
          `${projectPath}${path.sep}.eslintrc.json`,
          `${newApiPath}${path.sep}.eslintrc.json`
        );
        fs.copyFileSync(
          `${projectPath}${path.sep}.prettierrc`,
          `${newApiPath}${path.sep}.prettierrc`
        );
        fs.rmSync(oldApiPath, { recursive: true });
      },
    },

    completeMessage: `
Congratulations!

You should have a functioning service at {{projectPath}}.
Two projects were created: 
  <root>/packages/api/{{serviceName}} named @my-app/{{serviceName}}-api
  <root>/packages/services/{{serviceName}} named @my-app/{{serviceName}}

To get started:
  1. Add both @my-app/{{serviceName}}-api and @my-app/{{serviceName}} to <root>/rush.json
  2. Add @my-app/{{serviceName}} to <root>/common/config/deploy.json
  3. Run "rush update && rush format --to sample && rush lint --to sample && rush build --to sample && rush test --to sample --verbose"
  
  Enjoy...

		`,
  };
};

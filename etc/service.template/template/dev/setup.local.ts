// eslint-disable-next-line import/no-extraneous-dependencies
import fg from 'fast-glob';
import pkgDir from 'pkg-dir';
import fs from 'fs';
import path from 'path';
import * as os from 'os';

let { log } = console;

const prefixExampleSuffixRX = /^(?<prefix>.*\/)example(?<suffix>[^/]+\.env)$/;
function exampleToLocalPath(examplePath: string): string {
  const localPath = examplePath.replace(prefixExampleSuffixRX, '$1local$2');

  if (localPath === examplePath) {
    throw new Error(
      `Unable to convert example path into local path. Example path="${examplePath}".`
    );
  }

  return localPath;
}

async function getAppRoot(): Promise<string> {
  let root = (await pkgDir(__dirname)) as string;
  if (!root) {
    throw new Error(`Unable to determine project root directory.`);
  }
  root = root.replace(/\\/g, '/');

  return root;
}

function unhandledError(err: any) {
  console.error(`Unhandled error:`); // eslint-disable-line no-console
  console.error(err); // eslint-disable-line no-console
  setTimeout(() => {
    process.exit(1);
  }, 1000);
}

process.on('uncaughtException', unhandledError);
process.on('unhandledRejection', unhandledError);

// ===========================================================

type VariableMap = Map<string, string | undefined>;

function addEmptyLineIfDoesntExist(file: string) {
  const data = fs.readFileSync(file, 'utf-8');
  const lastLine = data.split(/\r?\n/).pop();
  if (lastLine !== '' && lastLine !== os.EOL) {
    fs.appendFileSync(file, '\n');
  }
}

function readAllKeys(file: string): VariableMap {
  const data = fs.readFileSync(file, 'utf-8');
  const lines = data.split(/\r?\n/);

  const keys = new Map<string, string | undefined>();
  lines.forEach(line => {
    const [, key, value] = line.match(/^(\w+)=(.+)/) ?? [];

    if (key) {
      keys.set(key, value);
    }
  });
  return keys;
}

function getVariableToAdd(
  exampleMap: VariableMap,
  localMap: VariableMap
): VariableMap {
  const variableToAdd = new Map();

  exampleMap?.forEach((value, key) => {
    if (!localMap?.get(key)) {
      variableToAdd.set(key, value);
    }
  });
  return variableToAdd;
}

function addVariables(
  file: string,
  variablesMap: Map<string, string | undefined>
) {
  addEmptyLineIfDoesntExist(file);
  const writeStream = fs.createWriteStream(file, { flags: 'a' });
  variablesMap.forEach((value, key) => {
    writeStream.write(`${key}=${value}\n`);
  });
  writeStream.end();
}

function addMissingVariables(
  localConfigPath: string,
  variablesToAdd: VariableMap
) {
  addVariables(localConfigPath, variablesToAdd);
}

function updateLocalConfig(
  projectRoot: string,
  exampleCfg: string,
  localCfg: string
): boolean {
  const variablesToAdd = getVariableToAdd(
    readAllKeys(exampleCfg),
    readAllKeys(localCfg)
  );
  addMissingVariables(localCfg, variablesToAdd);
  const addedVariablesString = Array.from(variablesToAdd.keys()).join(', ');
  if (addedVariablesString) {
    log(
      `  - Updated ${localCfg.replace(
        `${projectRoot}/`,
        ''
      )}. New variables have been added: ${addedVariablesString}`
    );
    return true;
  }
  return false;
}

async function initLocalConfigs(projectRoot: string, configType: string = '*') {
  const exampleConfigs = await fg([
    `${projectRoot}/envs/example.${configType}.env`
  ]);
  const localConfigs = await fg([
    `${projectRoot}/envs/local.${configType}.env`
  ]);
  const configsToCreate = exampleConfigs.filter(exampleCfg => {
    const localCfg = exampleToLocalPath(exampleCfg);
    const alreadyExists = localConfigs.includes(localCfg);
    if (alreadyExists) {
      if (!updateLocalConfig(projectRoot, exampleCfg, localCfg)) {
        log(
          `  - SKIP  Create ${localCfg.replace(
            `${projectRoot}/`,
            ''
          )}.  Already exists.`
        );
      }
    }
    return !alreadyExists;
  });

  configsToCreate.forEach(exampleCfg => {
    const localCfg = exampleToLocalPath(exampleCfg);
    fs.copyFileSync(exampleCfg, localCfg);

    log(
      `  - CREATE  ${localCfg.replace(
        `${projectRoot}/`,
        ''
      )}  basing on  ${exampleCfg.replace(`${projectRoot}/`, '')}`
    );
  });
}

async function removeLocalConfig(
  projectRoot: string,
  configType: string = '*'
) {
  const localConfigs = await fg([
    `${projectRoot}/envs/local.${configType}.env`
  ]);
  localConfigs.forEach(localConfigPath => {
    fs.unlinkSync(localConfigPath);
    log(`  - Removed  ${localConfigPath.replace(`${projectRoot}/`, '')}`);
  });
}

// ===========================================================

async function run() {
  const cliArgs = process.argv.slice(2);
  // Force flag have to be passed through the npm run by: "npm run setup:local -- --force"
  // If force flag is set, the local.*.env file is deleted and recreated from example.*.env file.
  const forceFlag = cliArgs.some(arg => arg === '-f' || arg === '--force');
  const configTypeIndex = cliArgs.findIndex(
    arg => arg === '-c' || arg === '--configtype'
  );
  let configTypeValue = '*';
  if (configTypeIndex != -1) {
    configTypeValue = cliArgs[configTypeIndex + 1];
    if (!configTypeValue) {
      console.error(`The configType value not provided`);
      process.exit(1);
    }
  }

  const root = await getAppRoot();
  const projectName = path.basename(root);
  // eslint-disable-next-line no-console
  log = (...args: any[]) => console.log(`[${projectName}] `, ...args);

  log(`Local dev env setup START...`);
  if (forceFlag) {
    await removeLocalConfig(root, configTypeValue);
  }
  await initLocalConfigs(root, configTypeValue);

  log(`Local dev env COMPLETE.`);
}

run();

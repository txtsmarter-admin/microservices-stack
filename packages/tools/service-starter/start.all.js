const cp = require("child_process");
const fs = require("fs");
const { services, kill_service, THE_ROOT } = require("./common");

let iTerm2WindowId;

function new_terminal(cmd) {
  switch (process.platform) {
    // TODO WINDOWS
    case "win32":
      console.error("Not implemented for Windows");
      process.exit(-1);
    case "darwin":
      if (iTerm2WindowId) {
        const res = cp.execSync(
          `~/.iterm2/it2api create-tab --window ${iTerm2WindowId} | awk '{for(i=1;i<=NF;i++){if ($i ~ /id=/){print $i}}}' | awk -F= '{print $2}'`
        );
        const sessionId = res.toString().replace(/[\r\n]+/gm, "");
        cp.execSync(`~/.iterm2/it2api send-text ${sessionId} "cd ${THE_ROOT}"`);
        cp.execSync(`~/.iterm2/it2api send-text ${sessionId} "\n"`);
        cp.execSync(`~/.iterm2/it2api send-text ${sessionId} "${cmd}"`);
        cp.execSync(`~/.iterm2/it2api send-text ${sessionId} "\n"`);
      }

      break;
    case "linux":
      cp.exec(`x-terminal-emulator -e bash -c "${cmd}; exec bash"`, {
        cwd: THE_ROOT,
      });
      break;
    default:
      return false;
  }
}
function start_db() {
  cp.execSync("./packages/tools/service-starter/db/start-databases.sh", {
    stdio: "inherit",
    cwd: THE_ROOT,
  });
}
function start_broker() {
  cp.execSync("./packages/tools/service-starter/broker/start.sh", {
    stdio: "inherit",
    cwd: THE_ROOT,
  });
}
function getServiceNamesFromArgs(cliArgs) {
  const allFlag = cliArgs.some((arg) => arg === "-a" || arg === "--all");

  const servicesIndex = cliArgs.findIndex((arg) => {
    if (arg === "-s" || arg === "--services") {
      return true;
    }
  });

  let serviceNames = [];

  if (allFlag) {
    serviceNames = Array.from(services.keys()).filter((serviceName) => {
      return services.get(serviceName).autoStart;
    });
  } else if (servicesIndex !== -1) {
    const indexEnd = cliArgs
      .slice(servicesIndex + 1)
      .findIndex((arg) => arg[0] === "-");
    serviceNames =
      indexEnd !== -1
        ? cliArgs.slice(servicesIndex + 1, indexEnd + 1)
        : cliArgs.slice(servicesIndex + 1);
  } else {
    console.error(`No services provided to start. Example usage:
      
      Start specific services only (gateway and authz):
      $ rush start:all -s "gateway authz"

      Start all services:
      $ rush start:all -a
    `);
    process.exit(-1);
  }
  return serviceNames;
}
function getEnvFromArgs(cliArgs) {
  const envIndex = cliArgs.findIndex((arg) => {
    if (arg === "-e" || arg === "--env") {
      return true;
    }
  });

  return envIndex !== -1 ? cliArgs[envIndex + 1] : `dev`;
}
function gen_run_cmd(envioronment = "dev") {
  return `npm run ${envioronment}`;
}

function run() {
  const cliArgs = process.argv.slice(2);

  const serviceNames = getServiceNamesFromArgs(cliArgs);
  const env = getEnvFromArgs(cliArgs);

  start_db();
  start_broker();

  if (process.platform === "darwin") {
    // check if we already have a window
    let windowRunning = false;
    let windowId;
    if (fs.existsSync(`${THE_ROOT}/.iterm2-window`)) {
      windowId = fs
        .readFileSync(`${THE_ROOT}/.iterm2-window`)
        .toString()
        .replace(/[\r\n]+/gm, "");
      try {
        cp.execSync(`~/.iterm2/it2api show-hierarchy | grep ${windowId}`);
        windowRunning = true;
      } catch (e) {
        windowRunning = false;
      }
    }
    if (windowRunning) {
      iTerm2WindowId = windowId;
    } else {
      const res = cp.execSync(
        `~/.iterm2/it2api-extra create-window | tee .iterm2-window`,
        {
          cwd: THE_ROOT,
        }
      );
      iTerm2WindowId = res.toString().replace(/[\r\n]+/gm, "");
    }
  }

  serviceNames.forEach((name) => {
    const service = services.get(name);
    if (service) {
      kill_service(service.path);
      new_terminal(`cd ${service.path} && ${gen_run_cmd(env)}`);
    } else {
      console.warn(`Service ${name} not found in the map`);
    }
  });
}

//-----------------------------------------------------
//------------SCRIPT EXECUTION-------------------------
//-----------------------------------------------------
run();
// on linux exit after finish, for mac is probably fine as well, but I can't test it...
if (process.platform == "linux") process.exit(0);

const cp = require("child_process");
const { join } = require("path");

const THE_ROOT = __dirname + "/../../..";
const services = new Map();
const SERVICE_ROOT_PATH = `./packages/services`;
const APPS_ROOT_PATH = `./packages/apps`;
const TOOLS_ROOT_PATH = `./packages/tools`;

services.set("authz", {
  autoStart: true,
  path: join(SERVICE_ROOT_PATH, "authz"),
});
services.set("gw", {
  autoStart: true,
  path: join(SERVICE_ROOT_PATH, "gw"),
});
services.set("service-sql", {
  autoStart: true,
  path: join(SERVICE_ROOT_PATH, "service-sql"),
});
services.set("service-mongo", {
  autoStart: true,
  path: join(SERVICE_ROOT_PATH, "service-mongo"),
});

const kill_service = (servicePath) => {
  switch (process.platform) {
    // TODO WINDOWS
    case "darwin":
      try {
        // search for existing sessions, this will throw (since grep will exit with non-zero code) if nothing is found
        cp.execSync(`~/.iterm2/it2api list-sessions | grep ${servicePath}`);
        // since we did not throw, we have running sessions
        const iTerm2Sessions = cp
          .execSync(
            `~/.iterm2/it2api list-sessions | grep ${servicePath} | awk '{for(i=1;i<=NF;i++){if ($i ~ /id=/){print $i}}}' | awk -F= '{print $2}'`
          )
          .toString()
          .split("\n")
          .filter((sessionId) => sessionId.length > 0);
        iTerm2Sessions.forEach((session) => {
          cp.execSync(
            `~/.iterm2/it2api-extra close-session --session ${session}`
          );
        });
      } catch (e) {
        /* no-op */
      }
      break;
    case "linux": {
      let stringToFind = `/${servicePath.replace(
        /\//g,
        "\\/"
      )} && npm run (dev|stg|prd)/`;
      const pidBuffer = cp.execSync(
        `ps -ef | awk '${stringToFind} {print $2}'`,
        { cwd: THE_ROOT }
      );
      const pidArray = pidBuffer.toString().split("\n");
      pidArray.forEach((pid) => {
        if (pid !== "") {
          cp.execSync(`kill -9 ${pid}`, { cwd: THE_ROOT });
        }
      });
      break;
    }
    default:
      console.warn("cannot kill service on specific platform");
  }
};
module.exports = {
  kill_service,
  services,
  THE_ROOT,
};

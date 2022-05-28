const { kill_service, services, THE_ROOT } = require("./common");
const cp = require("child_process");

function stop_db() {
  cp.execSync("./packages/tools/service-starter/db/stop-databases.sh", {
    stdio: "inherit",
    cwd: THE_ROOT,
  });
}
function stop_broker() {
  cp.execSync("./packages/tools/service-starter/broker/stop.sh", {
    stdio: "inherit",
    cwd: THE_ROOT,
  });
}

function run() {
  Array.from(services.values())
    .map((service) => service.path)
    .forEach((path) => {
      kill_service(path);
    });
  stop_db();
  stop_broker();
}

//-----------------------------------------------------
//------------SCRIPT EXECUTION-------------------------
//-----------------------------------------------------
run();

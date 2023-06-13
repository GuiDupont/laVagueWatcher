import { log, sleepMinutes, sleepSeconds } from "./utils";
import moment from "moment";
import { activateBot, sendMessageManagement } from "./telegram/telegramBot";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { sports } from "./data/sports";
import { minutesToSleep } from "./laVague/timeToSleep";
import { seancesChecker } from "./seancesChecker";
import { daysInMinutes } from "./utils";

dotenv.config();

export let checker: seancesChecker = new seancesChecker();

process.env.program_status = "SETTING UP";

async function setUp() {
  process.on("SIGINT", function () {
    checker!.browser?.close();
    process.exit();
  });
  moment.locale("fr");
  await activateBot();
  if (process.platform !== "darwin")
    await sendMessageManagement("[Let's get back to work]");
}

async function closeBrowser() {
  try {
    if (checker) await checker.browser?.close();
  } catch (error) {
    log(["error while closing: ", error]);
  }
}

async function launchProgram() {
  while (1) {
    try {
      let checker: seancesChecker = await new seancesChecker().init();
      await checker.loginLaVague();
      await checker.goToActivityPage();
      await checker.checkSportsReadiness();
      await checker.bookSportsReady();
      checker.booker!.checkIfBookingIsOverForAllSports();
      if (checker.booker?.isOver) {
        await checker.clear();
        process.env.EXCEPTIONNAL_SLEEP = daysInMinutes(4).toString();
      }
    } catch (err: any) {
      if (checker) await checker.clear();
      log((err as Error).message);
      await sleepSeconds(60);
      continue;
    }

    process.env.last_check = moment().format("LLLL");
    await sleepMinutes(minutesToSleep(sports));
  }
}

async function main() {
  try {
    setUp();
    await launchProgram();
  } catch (e) {}
}

main()
  .catch((e) => console.log("error: " + e))
  .finally(async () => {});

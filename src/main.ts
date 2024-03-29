import { log, sleepMinutes, sleepSeconds } from "./utils";
import moment from "moment";
import { activateBot, sendMessageManagement } from "./telegram/telegramBot";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { sports } from "./data/sports";
import { minutesToSleep } from "./timeToSleep";
import { seancesChecker } from "./seancesChecker";
import { daysInMinutes } from "./utils";

dotenv.config();

export let checker: seancesChecker;

process.env.program_status = "SETTING UP";

async function setUp() {
  process.on("SIGINT", function () {
    checker!.browser?.close();
    process.exit();
  });
  moment.locale("fr");
  await activateBot();
  await sendMessageManagement("[Let's get back to work]");
}

async function launchProgram() {
  let checker: seancesChecker = await new seancesChecker().init();
  while (1) {
    try {
      if (checker.page?.url() === "about:blank") await checker.loginLaVague();
      await checker.goToActivityPage().catch((err) => {
        throw new Error(err);
      });
      await checker.checkSportsReadiness();
      await checker.bookSportsReady();
      checker.booker!.checkIfBookingIsOverForAllSports();
      process.env.last_check = moment().format("LLLL");
      if (checker.booker?.isOver) {
        await checker.resetSports();
        // process.env.EXCEPTIONNAL_SLEEP = "";
        process.env.EXCEPTIONNAL_SLEEP = daysInMinutes(4).toString();
      }
    } catch (err: any) {
      sendMessageManagement(
        "I had an error, I'm restarting the program. Error: " +
          (err as Error).message
      );
      if (checker) await checker.close();

      checker = await new seancesChecker().init();
      log([(err as Error).message, "error"]);
      // process.env.EXCEPTIONNAL_SLEEP = "0.1";
    }

    await sleepMinutes(minutesToSleep(sports));
  }
}

async function main() {
  checker = new seancesChecker();
  try {
    setUp();
    await launchProgram();
  } catch (e) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});

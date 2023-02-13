import moment from "moment";
import { Browser, PuppeteerNode } from "puppeteer";
import { log } from "./logging";
import { getPath } from "./utils";
const puppeteer: PuppeteerNode = require("puppeteer");

async function startBrowser() {
  try {
    log(["opening browser..."]);
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      // userDataDir: "./chrome_data",
      executablePath: getPath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    process.on("SIGINT", function () {
      browser?.close();
      process.exit();
    });
    console.log("[" + moment().format() + "] ", "browser opened !");
    return browser;
  } catch (err) {
    console.log(err);
    throw new Error("could not create a browser instance");
  }
}

export default startBrowser;

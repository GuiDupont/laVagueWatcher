import { Browser, PuppeteerNode } from "puppeteer";
const puppeteer: PuppeteerNode = require("puppeteer");

async function startBrowser() {
  try {
    console.log("opening browser...");
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      // userDataDir: "./chrome_data",
      // executablePath: "/usr/bin/chromium-browser",
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    process.on("SIGINT", function () {
      browser?.close();
      process.exit();
    });
    console.log("browser opened !");
    return browser;
  } catch (err) {
    console.log(err);
    throw new Error("could not create a browser instance");
  }
}

export default startBrowser;

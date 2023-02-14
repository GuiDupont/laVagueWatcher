import { Context, Markup, Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Update } from "telegraf/typings/core/types/typegram";
import { ISeance, ISport } from "./types";
import { ethers } from "ethers";
import { formatDayDate, sleep } from "./utils";
import startBrowser from "./startBrowser";
import { log } from "./logging";
import { goToSportMainPage, loginLaVague } from "./watcher";
import { Page } from "puppeteer";
import { CONFIRM_BOOK_URL } from "./constants";
import { sports } from "./sports";

dotenv.config();

export async function sendMessageManagement(message: string) {
  const bot = new Telegraf(process.env.CONV_TOKEN!);
  bot.telegram.sendMessage(process.env.CONV_ID_MANAGEMENT!, message);
}

export async function sendMessage(message: string) {
  if (process.platform === "darwin") return;
  const bot = new Telegraf(process.env.CONV_TOKEN!);
  bot.telegram.sendMessage(process.env.CONV_ID!, message);
}

export async function activateBot() {
  const bot = new Telegraf(process.env.CONV_TOKEN!);

  bot.command("/ok", async (ctx) => {
    ctx.deleteMessage();

    ctx.reply("ok");
  });

  bot.command("/test", async (ctx) => {
    ctx.deleteMessage();

    sendMessage("test");
  });

  bot.command("/status", async (ctx) => {
    ctx.deleteMessage();
    if (process.env.program_status)
      sendMessageManagement(process.env.program_status);
    else sendMessageManagement("no status");
  });

  bot.command("/conv_id", (ctx) => {
    ctx.deleteMessage();
    ctx.reply(ctx.chat.id.toString());
  });

  bot.command("/réserver", (ctx) => {
    ctx.deleteMessage();
    return ctx.reply(
      `Sélectionnez un sport svp`,
      Markup.keyboard(sports.map((s) => "/" + s.name))
    );
  });

  bot.command("/sports", (ctx) => {
    return ctx.reply(
      `Sélectionnez un sport svp`,
      Markup.keyboard([
        sports
          .filter((v, i, array) => i <= array.length / 2)
          .map((s) => "/" + s.name),
        sports
          .filter((v, i, array) => i > array.length / 2)
          .map((s) => "/" + s.name),
      ])
    );
  });

  bot.launch();
  return bot;
}

async function bookASeance(page: Page, sport: ISport, i: number) {
  await page.waitForNetworkIdle({ timeout: 0 });
  await page.goto(sport.next_period.url!, {
    timeout: 0,
  });
  await page.waitForNetworkIdle({ timeout: 0 });

  const buttons = await page.$$("table tbody tr td table tbody tr td img");

  await buttons[2 + i * 3].click();

  const prenom = await page.waitForSelector('input[name="prenom"]', {
    timeout: 0,
  });
  await prenom?.type(process.env.PRENOM!);
  const nom = await page.waitForSelector('input[id="nom"]', {
    timeout: 0,
  });
  await nom?.type(process.env.NOM!);
  const validate = await page.waitForSelector(
    'input[value="Je valide ma réservation"]',
    {
      timeout: 0,
    }
  );
  await validate?.click();
  await page.waitForNetworkIdle({ timeout: 0 });
  await page.goto(CONFIRM_BOOK_URL, { timeout: 0 });
  await page.waitForNetworkIdle({ timeout: 0 });
}

function setUpSeancesInteractions(
  bot: Telegraf<Context<Update>>,
  seances: ISeance[],
  sport: ISport
) {
  seances.forEach((s, i) => {
    let answer = `Inscription à la séance de ${sport.name} le ${formatDayDate(
      s.date
    )} à ${s.plage} validée: --> /sports pour changer de sport`;
    bot.command(`/${s.hash}`, async (ctx) => {
      ctx.deleteMessage();
      ctx.reply("Inscription en cours... patientez svp");
      let browser = await startBrowser().catch((e) => {
        log(["error starting Browser: ", e]);
        return undefined;
      });
      if (!browser) {
        answer = "Erreur lors de l'inscription";
        return ctx.reply(answer);
      }
      try {
        let page = await loginLaVague(browser);
        if (!page.isClosed) await page.close();
        goToSportMainPage(page, sport!);
        await bookASeance(page, sport, i);
        if (browser) await browser.close();
      } catch (e) {
        await sendMessageManagement("Error while booking a seance");
        answer = "Erreur lors de l'inscription";
        return ctx.reply(answer);
      }
      return ctx.reply(answer);
    });
  });
}

export function setUpInteractions(
  bot: Telegraf<Context<Update>>,
  sports: ISport[]
) {
  sports.forEach((sport) => {
    const inputs = sport.next_period.seances?.map((s) => {
      s.hash = ethers.id(`/${sport.name}${s.date} à ${s.plage}`).slice(0, 6);
      return `/${s.hash} - ${sport.name} ${formatDayDate(
        s.date
      )} à ${s.plage.slice(0, 5)} ${s.available ? "➡️" : "❌"}`;
    }) as string[];

    setUpSeancesInteractions(bot, sport.next_period.seances!, sport);
    log(["configuring :", sport.name]);
    bot.command("/" + sport.name.split(" ")[0], (ctx) => {
      ctx.deleteMessage();
      const filtered = inputs
        .filter((v) => v.includes("➡️"))
        .concat(["/sports"]);
      const edit = inputs.map((input) => {
        return { text: "test", callback_data: "dadedidodu" };
      });
      const final = [];
      final.push(filtered.slice(0, filtered.length / 2));
      final.push(filtered.slice(filtered.length / 2, filtered.length));

      return ctx.reply(
        `Voici les séances disponibles pour le ${sport.name}`,
        Markup.keyboard(
          // edit
          final
          // inputs.filter((v) => v.includes("➡️")).concat(["/sports"])
        )
      );
    });
  });
}

import { Context, Markup, Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { Update } from "telegraf/typings/core/types/typegram";
import { ISeance, ISport } from "./types";
import { ethers } from "ethers";
import { formatDayDate } from "./utils";

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
    ctx.reply("ok");
  });

  bot.command("/test", async () => {
    sendMessage("test");
  });

  bot.command("/status", async () => {
    if (process.env.program_status)
      sendMessageManagement(process.env.program_status);
    else sendMessageManagement("no status");
  });

  bot.command("/conv_id", (ctx) => ctx.reply(ctx.chat.id.toString()));

  bot.command("/Enregistrer", (ctx) => {
    return ctx.reply("NOT YET DONE");
  });

  bot.launch();
  return bot;
}

function setUpSeancesInteractions(
  bot: Telegraf<Context<Update>>,
  seances: ISeance[],
  sport: ISport
) {
  seances.forEach((s) => {
    const hash = ethers.id(`/${sport.name}-${s.date}-${s.plage}`).slice(0, 6);
    bot.command(`/${hash}`, (ctx) => {
      return ctx.reply(
        `+ ${sport.name} le ${formatDayDate(s.date)} à ${
          s.plage
        }, si c'est bon pour le ${sport.name}, clique sur /Enregistrer.`
      );
    });
  });
}

export function setUpInteractions(
  bot: Telegraf<Context<Update>>,
  sports: ISport[]
) {
  sports.forEach((sport) => {
    setUpSeancesInteractions(bot, sports[0].next_period.seances!, sport);
    const value = sports[0].next_period.seances?.map((s) => {
      const hash = ethers.id(`/${sport.name}-${s.date}-${s.plage}`).slice(0, 6);
      return `/${hash}-${formatDayDate(s.date)}-${s.plage}`;
    }) as string[];
    value.push("/Enregistrer");
    bot.command("/" + sport.name, (ctx) => {
      return ctx.reply(
        `Voici les séances disponibles pour le ${sport.name}`,
        Markup.keyboard(value)
      );
    });
  });
}

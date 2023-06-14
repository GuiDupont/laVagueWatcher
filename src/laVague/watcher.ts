import { Page } from "puppeteer";
import { CRENEAUX_URL } from "../data/constants";
import { ISeance, ISport } from "../types/types";
import { log } from "../utils";

// import { sendMessageManagement } from "../telegram/telegramBot";

export async function prepareNextPeriod(page: Page, sport: ISport) {
  const slotsSelector = await page.waitForSelector("#liste_periodes", {
    timeout: 0,
  });
  log(["I have slots " + sport.name + " page"]);
  const slots = await slotsSelector?.evaluate((el) => {
    return Array.from(el.children).map((child) => {
      const period = (child as HTMLInputElement).value;
      return {
        begin_end: child.innerHTML,
        period_id: period,
      };
    });
  });
  if (!slots) return;

  sport.next_period = slots[slots.length - 1];
  sport.next_period.url = `${CRENEAUX_URL}&niveau=${sport.niveau}&periode=${sport.next_period.period_id}&tarif=${sport.tarif}`;
  await page.goto(sport.next_period.url!, {
    timeout: 0,
  });
  await page.waitForNetworkIdle({ timeout: 10_000 }).catch(() => {});

  sport.next_period.seances = await page.$$eval("table", (el: any) => {
    const table = el[1] as HTMLTableElement;
    const rows = Array.from(table.rows);
    const result: ISeance[] = [];
    rows.forEach((row) => {
      const cell = Array.from(row.children);

      const date = (cell[0] as any).innerText;
      const capacity = (cell[1] as any).innerText
        .replace(/(\r\n|\n|\r|\t)/gm, " ")
        .split(" ")
        .filter((el: string) => el.includes("/"));

      const hours = (cell[1] as any).innerText
        .replace(/(\r\n|\n|\r|\t)/gm, " ")
        .split(" ")
        .filter((el: string) => el.includes(">"));
      for (let i = 0; i < hours.length; i++) {
        result.push({
          date: date,
          plage: hours[i],
          booked: false,
          available: capacity[i].split("/")[0] != capacity[i].split("/")[1],
        });
      }
    });

    return result;
  });
}

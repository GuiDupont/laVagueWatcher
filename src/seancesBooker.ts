import { Page, PuppeteerNode } from "puppeteer";
import { sports } from "./data/sports";
import { sendMessage, sendMessageManagement } from "./telegram/telegramBot";

import { ISeance, ISport } from "./types/types";
import { seancesChecker } from "./seancesChecker";
import {
  isTest,
  log,
  nextPeriodIsPrepared,
  sleep,
  sleepMinutes,
  sleepSeconds,
} from "./utils";
import { CONFIRM_BOOK_URL, CRENEAUX_URL } from "./data/constants";

export class seancesBooker {
  page: Page;
  sports: ISport[];
  isOver: boolean = false;
  checker: seancesChecker;

  constructor(page: Page, sports: ISport[], checker: seancesChecker) {
    this.page = page;
    this.sports = sports;
    this.checker = checker;
  }

  async sendSuccessMessage(sport: ISport, seances: ISeance[], index: number) {
    if (isTest()) return;
    sendMessage(
      `J'ai réservé une séance de ${sport.name} le ${seances[index].date} à ${seances[index].plage}`
    );
  }

  async sendFailureMessage(sport: ISport, seances: ISeance[], index: number) {
    if (isTest()) return;
    sendMessage(
      `J'ai eu un probléme en réservant: ${sport.name} le ${seances[index].date} à ${seances[index].plage}`
    );
  }

  private checkIfBookingIsOverForOneSport(sport: ISport) {
    const seances = sport.next_period.allSeances!;
    // for (let i = 0; i < sport.next_period.wantedSeancesIndexes!.length; i++) {
    //   const index = sport.next_period.wantedSeancesIndexes![i];
    //   if (seances[index].booked === false) return false;
    // }

    return true;
  }

  checkIfBookingIsOverForAllSports() {
    this.isOver = true;
    for (let i = 0; i < this.sports.length; i++) {
      this.isOver = this.sports[i].doneBooking;
      if (this.isOver === false) break;
    }
  }

  async bookSportsReady() {
    for (let i = 0; i < this.sports.length; i++) {
      console.log("readyToBeBooked", sports[i].readyToBeBooked);
      if (sports[i].readyToBeBooked) {
        if (!nextPeriodIsPrepared(sports[i]))
          await this.prepareNextPeriod(sports[i]).catch((err) =>
            sendMessageManagement(`can 't prepare next period ${err.message}`)
          );
        console.log("nextPeriodIsPrepared", nextPeriodIsPrepared(sports[i]));
        if (nextPeriodIsPrepared(sports[i])) {
          sports[i].next_period.wantedAndAvailableSeancesIndexes =
            this.getButtonIndexes(sports[i]);
          console.log(sports[i].next_period.wantedAndAvailableSeancesIndexes);
          await this.bookSeances(sports[i]).catch((err) =>
            sendMessageManagement(`can 't book seances ${err.message}`)
          );
        }
      }
    }
  }

  async prepareNextPeriod(sport: ISport) {
    await this.checker.goToSportMainPage(sport).catch(() => {
      throw new Error("Error in goToSportMainPage");
    });
    await this.setNextPeriodUrl(sport).catch(() => {
      throw new Error("Error in setNextPeriodUrl");
    });
    await this.page
      .goto(sport.next_period.url!, {
        timeout: 15_000,
      })
      .catch(() => {
        throw new Error(`Can't go to ${sport.next_period.url}`);
      });
    await this.page
      .waitForNetworkIdle({ timeout: 10_000 })
      .catch(() => console.log("network idle prepare next period"));
    console.log("before setNextPeriodSeances");
    await this.setNextPeriodSeances(sport).catch(() => {
      throw new Error("Error in setNextPeriodSeances");
    });
    console.log(sport.next_period.allSeances);
  }

  async setNextPeriodUrl(sport: ISport) {
    const slotsSelector = await this.page
      .waitForSelector("#liste_periodes", {
        timeout: 15_000,
      })
      .catch(() => {
        throw new Error(`Can't find #liste_periodes ${sport.name}`);
      });
    console.log(slotsSelector);

    log(["I have slots " + sport.name + " page"]);
    const slots = await slotsSelector
      ?.evaluate((el) => {
        return Array.from(el.children).map((child) => {
          const period = (child as HTMLInputElement).value;
          return {
            begin_end: child.innerHTML,
            period_id: period,
          };
        });
      })
      .catch(() => {
        return null;
      });

    if (!slots) {
      log(["I don't have slots " + sport.name + " page"]);
      throw new Error("I don't have slots " + sport.name + " page");
    }
    sport.next_period.begin_end = slots[slots.length - 1].begin_end;
    sport.next_period.period_id = slots[slots.length - 1].period_id;

    sport.next_period.url = `${CRENEAUX_URL}&niveau=${sport.niveau}&periode=${sport.next_period.period_id}&tarif=${sport.tarif}`;
  }

  async setNextPeriodSeances(sport: ISport) {
    console.log("prepare next period");
    sport.next_period.allSeances = await this.page
      .$$eval("table", (el: any) => {
        const table = el[1] as HTMLTableElement;
        const rows = Array.from(table.rows);

        const result: ISeance[] = [];

        rows.forEach((row) => {
          const cell = Array.from(row.children);

          const date = (cell[0] as any).innerText;
          const capacity = (cell[1] as any).innerText
            .replace(/(\r\n|\n|\r|\t)/gm, " ")
            .split(" ")
            .filter((el: string) => el.includes("/")) as string[];
          const hours = (cell[1] as any).innerText
            .replace(/(\r\n|\n|\r|\t)/gm, " ")
            .split(" ")
            .filter((el: string) => el.includes("h"));
          const places = capacity[0].split("/");
          result.push({
            date: date,
            plage: hours[0],
            booked: false,
            available: places as any,
          });
        });
        return result;
      })
      .catch(() => {
        throw new Error("Can't get seances");
      });
  }

  getButtonIndexes(sport: ISport) {
    const allSeances = sport.next_period.allSeances!;
    const indexes: number[] = [];

    sport.creneauxWanted.forEach((creneau) => {
      allSeances.forEach((seance, i) => {
        if (
          seance.date.includes(creneau.day) &&
          seance.plage.includes(creneau.begin_hour) &&
          seance.booked === false
        ) {
          if (seance.available) indexes.push(i);
          else if (!isTest())
            sendMessage(
              `Il n'y a plus de place pour ${sport.name} le ${seance.date} à ${seance.plage}`
            );
        }
      });
    });
    return indexes;
  }

  async bookSeances(sport: ISport) {
    const seances = sport.next_period.allSeances!;
    const indexes = sport.next_period.wantedAndAvailableSeancesIndexes!;
    for (let i = 0; i < indexes.length; i++) {
      if (seances[indexes[i]].booked === true) continue;
      await this.bookASeance(sport, indexes[i]).catch((err) => {
        log(["error booking a seance", err.message]);
      });
      if ((seances[indexes[i]].booked = true))
        this.sendSuccessMessage(sport, seances, indexes[i]);
      else {
        this.sendFailureMessage(sport, seances, indexes[i]);
      }
    }
    sport.doneBooking = true;
    for (let i = 0; i < indexes.length; i++) {
      if (seances[indexes[i]].booked === false) {
        sport.doneBooking = false;
        break;
      }
    }
  }

  async bookASeance(sport: ISport, index: number) {
    const seances = sport.next_period.allSeances!;

    await this.page
      .goto(sport.next_period.url!, {
        timeout: 15_000,
      })
      .catch(() => log(["done waiting for goto sport.next_period_url"]));

    const buttons = await this.page
      .$$("table tbody tr td table tbody tr td a")
      .catch(() => {
        log(["error getting buttons"]);
        throw new Error("Can't get buttons");
      });
    console.log(buttons);

    await buttons[index].click().catch((err: any) => {
      log(["error clicking on button", err.message]);
      throw new Error("Can't click on button");
    });

    try {
      await this.fillInscriptionForm().catch((err) => {
        log(["error filling inscription form", err.message]);
        throw new Error("Can't fill inscription form");
      });
    } catch (err: any) {
      log(["error filling inscription form", err.message]);
      throw new Error("Can't fill inscription form");
    }
    if (isTest()) {
      seances![index].booked = true;
      return;
    }

    const result = await this.page
      .goto(CONFIRM_BOOK_URL, { timeout: 15_000 })
      .catch(() => {
        log([`Goto ${CONFIRM_BOOK_URL}, didn't work`]);
        throw new Error(`Goto ${CONFIRM_BOOK_URL}, didn't work`);
      });
    await this.page.waitForNetworkIdle({ timeout: 10_000 }).catch(() => {
      log(["confirming book done"]);
    });
    if (result?.status() === 200) seances![index].booked = true;
  }

  async fillInscriptionForm() {
    // console.log("fill inscription form");
    const prenom = await this.page
      .waitForSelector('input[name="prenom"]', {
        timeout: 10_000,
      })
      .catch(() => {
        throw new Error("Can't find prenom");
      });
    await prenom?.type(process.env.PRENOM!);
    const nom = await this.page
      .waitForSelector('input[id="nom"]', {
        timeout: 10_000,
      })
      .catch(() => {
        throw new Error("Can't find nom");
      });
    await nom?.type(process.env.NOM!).catch(() => {
      throw new Error("Can't type nom");
    });
    const validate = await this.page
      .waitForSelector('input[value="Je valide ma réservation"]', {
        timeout: 10_000,
      })
      .catch(() => {
        throw new Error("Can't find validate");
      });
    await validate?.click().catch(() => {
      throw new Error("Can't click validate");
    });
    const dest = "https://moncentreaquatique.com/module-inscriptions/infos/";
    await this.page.goto(dest);

    await this.page.waitForNetworkIdle({ timeout: 10_000 }).catch(() => {
      log(["waiting for click done"]);
    });
  }
}

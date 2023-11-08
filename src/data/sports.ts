import { BODYPUMP_URL, CAF_URL, CT_URL, RPM_URL, ZUMBA_URL } from "./constants";

import { ISport } from "../types/types";

export const sports = [
  {
    url: RPM_URL,
    name: "RPM",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195387",
    doneBooking: false,
    next_period: {
      begin_end: "",
      period_id: "",
      url: "",
      allSeances: [],
      wantedAndAvailableSeancesIndexes: [],
    },
    id: 24,
    niveau: 0,
    readyToBeBooked: false,

    creneauxWanted: [
      {
        day: "Lundi",
        begin_hour: "18h15",
      },
      {
        day: "Mardi",
        begin_hour: "11h15",
      },
      {
        day: "Mardi",
        begin_hour: "20h30",
      },
      {
        day: "Jeudi",
        begin_hour: "11h15",
      },
    ],
  },
  // {
  //   url: CT_URL,
  //   name: "Circuit Training",
  //   lastValue: Number.MAX_SAFE_INTEGER,
  //   tarif: "1195335",
  //   doneBooking: false,
  //   next_period: { begin_end: "", period_id: "", url: "", allSeances: [] },
  //   id: 62,
  //   niveau: 126,
  //   readyToBeBooked: false,
  //   creneauxWanted: [
  //     {
  //       day: "Lundi",
  //       begin_hour: "11h15",
  //     },
  //     {
  //       day: "Vendredi",
  //       begin_hour: "18h00",
  //     },
  //   ],
  // },
  // {
  //   url: ZUMBA_URL,
  //   name: "Zumba",
  //   lastValue: Number.MAX_SAFE_INTEGER,
  //   tarif: "1195517",
  //   doneBooking: false,
  //   next_period: {
  //     begin_end: "",
  //     period_id: "",
  //     url: "",
  //     allSeances: [],
  //     wantedAndAvailableSeancesIndexes: [],
  //   },
  //   id: 25,
  //   niveau: 0,
  //   readyToBeBooked: false,
  //   creneauxWanted: [
  //     {
  //       day: "Mardi",
  //       begin_hour: "18h15",
  //     },
  //     {
  //       day: "Vendredi",
  //       begin_hour: "18h45",
  //     },
  //   ],
  // },
  // {
  //   url: BODYPUMP_URL,
  //   name: "Body Pump",
  //   lastValue: Number.MAX_SAFE_INTEGER,
  //   tarif: "1195413",
  //   doneBooking: false,
  //   next_period: {
  //     begin_end: "",
  //     period_id: "",
  //     url: "",
  //     allSeances: [],
  //     wantedAndAvailableSeancesIndexes: [],
  //   },
  //   id: 32,
  //   niveau: 0,
  //   readyToBeBooked: false,
  //   creneauxWanted: [
  //     {
  //       day: "Mercredi",
  //       begin_hour: "10h15",
  //     },
  //   ],
  // },
  // {
  //   url: CAF_URL,
  //   name: "CAF",
  //   lastValue: Number.MAX_SAFE_INTEGER,
  //   tarif: "1195361",
  //   doneBooking: false,
  //   next_period: {
  //     begin_end: "",
  //     period_id: "",
  //     url: "",
  //     allSeances: [],
  //     wantedAndAvailableSeancesIndexes: [],
  //   },
  //   id: 84,
  //   niveau: 106,
  //   readyToBeBooked: false,
  //   creneauxWanted: [
  //     {
  //       day: "Mardi",
  //       begin_hour: "10h15",
  //     },
  //     {
  //       day: "Mercredi",
  //       begin_hour: "18h45",
  //     },
  //   ],
  // },
] as ISport[];

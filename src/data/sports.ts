import { BODYPUMP_URL, CAF_URL, CT_URL, RPM_URL, ZUMBA_URL } from "./constants";

import { ISport } from "../types/types";

export const sports = [
  {
    url: CT_URL,
    name: "Circuit Training",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195335",
    next_period: { begin_end: "", period_id: "", url: "", seances: [] },
    id: 62,
    niveau: 126,
    ready: false,
    creneaux: [
      {
        day: "Lundi",
        begin_hour: "11h15",
      },
      {
        day: "Vendredi",
        begin_hour: "18h15",
      },
    ],
  },
  {
    url: RPM_URL,
    name: "RPM",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195387",
    next_period: { begin_end: "", period_id: "", url: "", seances: [] },
    id: 24,
    niveau: 0,
    ready: false,
    creneaux: [
      {
        day: "Mardi",
        begin_hour: "11h15",
      },
      {
        day: "Jeudi",
        begin_hour: "11h15",
      },
    ],
  },
  {
    url: ZUMBA_URL,
    name: "Zumba",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195517",
    next_period: { begin_end: "", period_id: "", url: "", seances: [] },
    id: 25,
    niveau: 0,
    ready: false,
    creneaux: [
      {
        day: "Mardi",
        begin_hour: "19h15",
      },
      {
        day: "Vendredi",
        begin_hour: "19h15",
      },
    ],
  },
  {
    url: BODYPUMP_URL,
    name: "Body Pump",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195413",
    next_period: { begin_end: "", period_id: "", url: "", seances: [] },
    id: 32,
    niveau: 0,
    ready: false,
    creneaux: [
      {
        day: "Mercredi",
        begin_hour: "10h15",
      },
    ],
  },
  {
    url: CAF_URL,
    name: "CAF",
    lastValue: Number.MAX_SAFE_INTEGER,
    tarif: "1195361",
    next_period: { begin_end: "", period_id: "", url: "", seances: [] },
    id: 84,
    niveau: 106,
    ready: false,
    creneaux: [
      {
        day: "Mardi",
        begin_hour: "10h15",
      },
    ],
  },
] as ISport[];

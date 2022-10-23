import moment from "moment";

export function log(messages: any[]) {
  console.log("[" + moment().format() + "] ");
  messages.forEach((msg) => console.log("                            " + msg));
}

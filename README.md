# Typescript Telegram WebAppData Validation

A simple way to validate the data received from Telegram while using Mini Apps.

As specified in [Telegram documentation](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app) the following process should be done to validate the received data:


To validate data received via the Mini App, one should send the data from the Telegram.WebApp.initData field to the bot's backend. The data is a query string, which is composed of a series of field-value pairs.

You can verify the integrity of the data received by comparing the received hash parameter with the hexadecimal representation of the HMAC-SHA-256 signature of the data-check-string with the secret key, which is the HMAC-SHA-256 signature of the bot's token with the constant string WebAppData used as a key.

Data-check-string is a chain of all received fields, sorted alphabetically, in the format key=<value> with a line feed character ('\n', 0x0A) used as separator – e.g., 'auth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>'.


```
// Packages
import dotenv from "dotenv";
import crypto from "node:crypto";

type ParsedInitData = {
  [key: string]: string;
};

function main() {
  dotenv.config();

  const initData: string = ""; // Data received from telegram.
  const initDataObject: ParsedInitData = parseInitData(decodeURIComponent(initData));
  const dataCheckString: string = serializeInitDataObject(initDataObject);

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(process.env.BOT_TOKEN!).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return initDataObject.hash === hash;
}

function parseInitData(initData: string): ParsedInitData {
  return initData.split("&").reduce((acc: ParsedInitData, pair: string) => {
    const [key, value] = pair.split("=");
    acc[key] = value;
    return acc;
  }, {});
}

function serializeInitDataObject(initDataObject: ParsedInitData): string {
  return Object.keys(initDataObject)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${initDataObject[key]}`)
    .sort()
    .join("\n");
}

console.log(main());
```
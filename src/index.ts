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

import type { Request, Response, NextFunction } from "express";
import * as path from "node:path";
import { appendFile } from "node:fs/promises";
import { pathExists, createDir, createFile } from "../fs/fsCRUDOperations";
const LOG_DIR = path.join(__dirname, "..", "..", "logs"); //PATH/logs
const LOG_FILE = path.join(LOG_DIR, "log.txt");

async function addLogMessage(message: string, file = LOG_FILE): Promise<void> {
  try {
    if (!(await pathExists(LOG_DIR))) {
      await createDir(LOG_DIR);
    }
    if (!(await pathExists(LOG_FILE))) {
      await createFile(LOG_FILE);
    }
    await appendFile(file, `${message}\n`);
  } catch (error) {
    console.error(error);
  }
}

export async function logger(req: Request, res: Response, next: NextFunction) {
  const dateTime = new Date().toISOString();
  const { method, originalUrl: url, ip } = req;
  const logString = `${dateTime}: ${method} from ${ip} at ${url}`;
  await addLogMessage(logString);
  console.log(logString);
  next();
}

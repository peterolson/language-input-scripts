import { Db, MongoClient } from "mongodb";

export function scheduleTask(
  name: string,
  task: (db: Db) => Promise<void>,
  interval: number
) {
  setInterval(async () => {
    console.log(`Running task '${name}'...`);
    await runTask(task);
    console.log(`Done task '${name}'`);
  }, interval);
}

export async function runTask(task: (db: Db) => Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    const connectionString = process.env.MONGO_CONNECTION_STRING;
    console.log("Connecting to mongoDB...");
    MongoClient.connect(connectionString, async (err, client) => {
      if (err) {
        console.log("Error connecting to mongoDB", err);
        client.close();
        reject();
        return;
      }
      const db = client.db("language-input");
      await task(db);
      resolve();
      client.close();
    });
  });
}

export function days(n) {
  return 1000 * 60 * 60 * 24 * n;
}

export function hours(n) {
  return 1000 * 60 * 60 * n;
}

export function minutes(n) {
  return 1000 * 60 * n;
}

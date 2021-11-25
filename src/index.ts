import * as dotenv from "dotenv";
import { writeFileSync } from "fs";
import { Db, MongoClient } from "mongodb";
import { downloadPlaylist } from "./youtube/downloadPlaylist";
import youtubedl from "youtube-dl-exec";
import { getPlaylistVideos } from "./youtube/getPlaylistVideos";
import { getVideoDetails } from "./youtube/getVideoDetails";

dotenv.config();

async function run(db: Db) {
  console.log("Running tasks...");

  await downloadPlaylist("zh", "UUKbBU7zv0PUdOMxPnenl_zg", db);

  console.log("Done");
}

const connectionString = process.env.MONGO_CONNECTION_STRING;
console.log("Connecting to mongoDB...");
MongoClient.connect(connectionString, async (err, client) => {
  if (err) {
    console.log("Error connecting to mongoDB", err);
    client.close();
    return;
  }
  const db = client.db("language-input");
  await run(db);
  client.close();
});

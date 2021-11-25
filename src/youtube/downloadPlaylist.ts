import { Db } from "mongodb";
import { getCaptions } from "./getCaptions";
import { getPlaylistVideos } from "./getPlaylistVideos";
import { insertYoutubeVideo } from "./insertVideo";

export async function downloadPlaylist(
  language: string,
  playlistId: string,
  db: Db
) {
  console.log("Downloading playlist...");
  const videos = await getPlaylistVideos(playlistId);
  console.log("Got videos", videos.length);
  let skipped = 0,
    inserted = 0;
  for (const video of videos) {
    try {
      const captionData = await getCaptions(video.url, language);
      if (!captionData) {
        skipped++;
        console.log("No captions for", video.url);
        continue;
      }
      console.log("Inserting", video.url);
      await insertYoutubeVideo(language, video, captionData, db);
    } catch (e) {
      console.log("Could not insert. Skipping...", e);
      skipped++;
      continue;
    }
    inserted++;
    console.log(
      "Inserted",
      inserted,
      "skipped",
      skipped,
      `Finished ${inserted + skipped} of ${videos.length}`
    );
  }
  console.log("Done downloading playlist.");
}

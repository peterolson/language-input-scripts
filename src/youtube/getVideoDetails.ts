import fetch from "node-fetch";

export async function getVideoDetails(youtubeId) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  return await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=contentDetails,snippet,status&key=${API_KEY}`
  ).then((res) => res.json());
}

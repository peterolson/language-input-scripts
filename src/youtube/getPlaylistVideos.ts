import {
  YoutubePlaylistItem,
  YoutubePlaylistItemsResponse,
  YoutubeVideoSummary,
} from "../types/youtube.types";
import fetch from "node-fetch";

export async function getPlaylistVideos(
  playlistId: string
): Promise<YoutubeVideoSummary[]> {
  let playlistItems: YoutubePlaylistItem[] = [];
  let pageToken = "";
  do {
    const { items, nextPageToken } = await fetchPlaylistItems(
      playlistId,
      pageToken
    );
    playlistItems = playlistItems.concat(items);
    pageToken = nextPageToken;
  } while (pageToken);
  return playlistItems.map((item) => ({
    title: item.snippet.title,
    thumb: item.snippet.thumbnails.medium.url,
    media: {
      type: "youtube",
      youtubeId: item.contentDetails.videoId,
    },
    url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`,
    publishedDate: new Date(item.contentDetails.videoPublishedAt),
    channel: item.snippet.channelTitle,
  }));
}

async function fetchPlaylistItems(
  playlistId: string,
  pageToken = ""
): Promise<YoutubePlaylistItemsResponse> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const endpoint = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,id,status,contentDetails&playlistId=${playlistId}&key=${API_KEY}&maxResults=50&pageToken=${pageToken}`;
  return (await fetch(endpoint).then((res) =>
    res.json()
  )) as YoutubePlaylistItemsResponse;
}

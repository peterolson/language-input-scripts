import { Media } from "./content.types";

export type YoutubePlaylistItemsResponse = {
  nextPageToken?: string;
  items: YoutubePlaylistItem[];
};

export type YoutubePlaylistItem = {
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
  };
  contentDetails: {
    videoId: string;
    videoPublishedAt: string;
  };
};

export type YoutubeVideoSummary = {
  title: string;
  thumb: string;
  media: Media;
  url: string;
  publishedDate: Date;
  channel: string;
};

export type YoutubeCaptions = {
  duration: number;
  captions: {
    start: number;
    end: number;
    text: string;
  }[];
};

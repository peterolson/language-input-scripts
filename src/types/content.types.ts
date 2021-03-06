import { ParsedText } from "./parse.types";

export type MediaType = "youtube" | "video" | "audio" | "none";
export type Media =
  | {
      type: "youtube";
      youtubeId: string;
    }
  | {
      type: "video";
      url: string;
    }
  | {
      type: "audio";
      url: string;
    }
  | {
      type: "none";
    };

export type ContentItem = {
  lang: string;
  title: string;
  thumb: string;
  parsedText: ParsedText;
  timings: [number, number][];
  media: Media;
  lemmas: string[];
  tradLemmas?: string[];
  wordCount: number;
  url: string;
  publishedDate: Date;
  channel: string;
  duration: number;
};

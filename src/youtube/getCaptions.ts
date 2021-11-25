import youtubedl from "youtube-dl-exec";
import fetch from "node-fetch";
import { YoutubeCaptions } from "../types/youtube.types";

export async function getCaptions(
  youtubeURL: string,
  language: string
): Promise<YoutubeCaptions | null> {
  const ytResponse = await youtubedl(youtubeURL, {
    dumpSingleJson: true,
  });
  if (!ytResponse) return null;
  const { duration } = ytResponse;
  const { subtitles } = ytResponse as any;
  if (!subtitles) return null;
  const lang = Object.keys(subtitles).filter((x) => x.startsWith(language))[0];
  if (!lang) return null;
  const captionURL = subtitles[lang].filter((x) => x.ext === "vtt")?.[0]?.url;
  if (!captionURL) return null;
  const vtt = await downloadVTT(captionURL);
  if (!vtt) return null;
  const captions = parseVTT(vtt);
  return { duration, captions };
}

async function downloadVTT(url: string) {
  try {
    return await fetch(url).then((res) => res.text());
  } catch (e) {
    return null;
  }
}

function parseVTT(vtt: string) {
  const parts = vtt.split("\n\n").slice(1);
  const parsed = parts
    .filter(Boolean)
    .map((part) => {
      const lines = part.split("\n");
      const time = lines[0].split(" --> ");
      const start = time[0].split(":").map((x) => +x);
      const end = time[1].split(":").map((x) => +x);
      const text = lines.slice(1).join(" ");
      return {
        start: start.reduce((a, b) => a * 60 + b, 0),
        end: end.reduce((a, b) => a * 60 + b, 0),
        text,
      };
    })
    .filter((x) => x.text.trim().length > 0);
  return parsed;
}

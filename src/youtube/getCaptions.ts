import youtubedl from "youtube-dl-exec";
import fetch from "node-fetch";
import { YoutubeCaptions } from "../types/youtube.types";
import { simplify } from "hanzi-tools";

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
  const caption = subtitles[lang].filter((x) => x.ext === "vtt")?.[0];
  const captionURL = caption?.url;
  if (!captionURL) return null;
  const vtt = await downloadVTT(captionURL);
  if (!vtt) return null;
  const captions = parseVTT(vtt);
  if (["zh-tw", "zh-hant"].includes(lang.toLowerCase())) {
    for (const caption of captions) {
      caption.text = simplify(caption.text);
    }
  }
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
      let lines = part.split("\n");
      if (lines[1].includes("-->") && lines[1].includes(":")) {
        lines = lines.slice(1);
      }
      const time = lines[0].split(" --> ");
      const start = time[0].split(":").map((x) => +x);
      const end = time[1].split(":").map((x) => +x.replace(/[^0-9.]/g, ""));
      if (start.some(isNaN) || end.some(isNaN))
        throw new Error("Invalid subtitle timing");
      const text = lines.slice(1).join(" ");
      return {
        start: start.reduce((a, b) => a * 60 + b, 0),
        end: end.reduce((a, b) => a * 60 + b, 0),
        text,
      };
    })
    .filter((x) => x.text.trim().replace(/\n/g, " ").length > 0);
  return parsed;
}

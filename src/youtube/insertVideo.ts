import { ParsedText } from "../types/parse.types";
import { YoutubeVideoSummary, YoutubeCaptions } from "../types/youtube.types";
import fetch from "node-fetch";
import { Db } from "mongodb";
import { ContentItem } from "../types/content.types";
import { charInCJK } from "../util/util";
import { existsSync, fstat, readFileSync, writeFileSync } from "fs";

let j = 0;

export async function insertYoutubeVideo(
  lang: string,
  summary: YoutubeVideoSummary,
  captionData: YoutubeCaptions
  // db: Db
) {
  const { duration, captions } = captionData;
  if (duration < 60) {
    throw new Error("Video is too short.");
  }
  const text = captions.map((c) => c.text).join("\n");
  const timings: [number, number][] = captions.map((c) => [c.start, c.end]);

  const parsedText: ParsedText = await parseText(text, lang);

  if (timings.length !== parsedText.lines.length) {
    parsedText.lines.forEach((line, i) => {
      console.log(
        line.sentences.map((s) => s.tokens.map((t) => t.text).join(" "))
      );
      console.log(JSON.stringify(text.split("\n")[i]));
      timings[i];
    });
    throw new Error("Timings and parsed text don't match");
  }
  const lemmaSet = new Set<string>();
  const tradLemmaSet = new Set<string>();
  let wordCount = 0;
  for (const line of parsedText.lines) {
    for (const sentence of line.sentences) {
      for (const token of sentence.tokens) {
        if (token.isWord) {
          wordCount++;
          if (token.lemma) lemmaSet.add(token.lemma.toLowerCase());
          if (lang === "zh") {
            const chars = [...token.text].filter(charInCJK);
            const tradChars = [...(token.tradText || token.text)].filter(
              charInCJK
            );
            for (const char of chars) {
              lemmaSet.add(char);
            }
            for (const char of tradChars) {
              tradLemmaSet.add(char);
            }
          }
        }
      }
    }
  }

  const item: ContentItem = {
    lang,
    ...summary,
    duration,
    parsedText,
    timings,
    lemmas: Array.from(lemmaSet),
    wordCount,
  };

  if (lang === "zh") {
    item.tradLemmas = Array.from(tradLemmaSet);
  }

  const fileName = `video_data/${lang}_${++j % 50}.json`;

  const file = existsSync(fileName)
    ? JSON.parse(String(readFileSync(fileName)))
    : {};
  file[item.url] = item;
  writeFileSync(fileName, JSON.stringify(file, null, 2));

  /*
  const contentCollection = db.collection("content");
  await contentCollection.updateOne(
    {
      url: item.url,
    },
    {
      $set: item,
    },
    { upsert: true }
  );*/
}

export async function parseText(
  text: string,
  lang: string
): Promise<ParsedText> {
  const response: ParsedText = await fetch("http://localhost:3000/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lang,
      text,
    }),
  }).then((res) => res.json());
  return response;
}

import { Db } from "mongodb";

export async function populateFrequency(db: Db) {
  const content = db.collection("content");
  const frequency = db.collection("frequency");
  const langs = await content.distinct("lang");
  console.log(langs);
  for (const lang of langs) {
    console.log(`Populating frequency for ${lang}...`);
    const filtered = await content
      .find(
        { lang },
        {
          projection: {
            lemmas: 1,
            tradLemmas: 1,
          },
        }
      )
      .toArray();
    console.log(`${filtered.length} documents found`);
    const freqDict = {};
    const tradFreqDict = {};
    let totalContent = 0;
    let totalLemmas = 0;
    for (const doc of filtered) {
      totalContent++;
      for (const lemma of doc.lemmas) {
        freqDict[lemma] = (freqDict[lemma] || 0) + 1;
        totalLemmas++;
      }
      for (const tradLemma of doc.tradLemmas || []) {
        tradFreqDict[tradLemma] = (tradFreqDict[tradLemma] || 0) + 1;
      }
    }
    await frequency.insertOne({
      lang,
      freqDict,
      tradFreqDict,
      totalContent,
      totalLemmas,
    });
    console.log(`Populated frequency for ${lang}`);
  }
}

export async function populateDifficulties(db: Db) {
  const content = db.collection("content");
  const frequency = db.collection("frequency");
  const langs = await content.distinct("lang");
  console.log(langs);
  for (const lang of langs) {
    console.log(`Populating difficulties for ${lang}...`);
    const { freqDict, tradFreqDict, totalContent, totalLemmas } =
      await frequency.findOne({ lang });
    const mostFrequentLemmas = Object.keys(freqDict).sort(
      (a, b) => freqDict[b] - freqDict[a]
    );
    const mostFrequentTradLemmas = Object.keys(tradFreqDict).sort(
      (a, b) => tradFreqDict[b] - tradFreqDict[a]
    );
    const filtered = await content
      .find(
        { lang },
        {
          projection: {
            lemmas: 1,
            tradLemmas: 1,
            _id: 1,
          },
        }
      )
      .toArray();
    console.log(`${filtered.length} ${lang} documents found`);
    let updated = 0;
    for (const doc of filtered) {
      const { _id, lemmas, tradLemmas } = doc;
      let difficulty = getDifficultyScore(mostFrequentLemmas, lemmas);
      let tradDifficulty = tradLemmas?.length
        ? getDifficultyScore(mostFrequentTradLemmas, tradLemmas)
        : difficulty;
      await content.updateOne(
        { _id },
        { $set: { difficulty, tradDifficulty } }
      );
      updated++;
      console.log(`Updated ${updated}/${filtered.length} ${lang} documents`);
    }
  }
}

function getDifficultyScore(mostFrequentLemmas: string[], lemmas: string[]) {
  let i = 0;
  let cutoff = 0.9;
  let understoodLemmas = 0;
  const lemmasSet = new Set(lemmas);
  const totalLemmas = lemmas.length;
  while (i < mostFrequentLemmas.length) {
    const lemma = mostFrequentLemmas[i];
    if (lemmasSet.has(lemma)) {
      understoodLemmas++;
    }
    if (understoodLemmas / totalLemmas >= cutoff) {
      return i;
    }
    i++;
  }
  return i;
}

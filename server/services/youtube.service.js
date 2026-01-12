import axios from "axios";
import config from "../config/index.js";
import logger from "../utils/logger.js";


const extractVideoId = (input) => {
  if (!input) return null;

  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // shorts / embed
    const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shorts) return shorts[1];

    const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embed) return embed[1];

  } catch {
    return null;
  }

  return null;
};

export const getYoutubeMetadata = async (youtubeUrlOrId) => {
  const apiKey = config?.youtube?.apiKey;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY");
  }

  const videoId = extractVideoId(youtubeUrlOrId);
  logger.info(`🎬 Extracted YouTube videoId: ${videoId}`);

  if (!videoId) return null;

  try {
    const r = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "snippet",
        id: videoId,
        key: apiKey,
      },
    });

    const item = r.data?.items?.[0];
    if (!item) return null;

    const snippet = item.snippet || {};
    return {
      videoId,
      title: snippet.title || "",
      description: snippet.description || "",
      tags: Array.isArray(snippet.tags) ? snippet.tags : [],
      channelTitle: snippet.channelTitle || "",
    };
  } catch (err) {
    throw new Error(`YouTube API error: ${JSON.stringify(err?.response?.data || err.message)}`);
  }
};

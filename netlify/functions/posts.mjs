// Pulls the latest posts from both Substack RSS feeds and returns them as JSON.
// The home page calls this at /api/posts. Netlify's CDN caches the response,
// so the feeds are only fetched about every 30 minutes, not on every visit.

const FEEDS = {
  ktt: "https://knowthetimes.substack.com/feed",
  tfr: "https://thefaithfulremnant.substack.com/feed",
};

const MAX_POSTS = 4;

function decode(text = "") {
  return text
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(xml, name) {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

export function parseFeed(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  return items.slice(0, MAX_POSTS).map((item) => {
    const enclosure = item.match(/<enclosure[^>]*url="([^"]+)"/i);
    const date = new Date(tag(item, "pubDate"));
    return {
      title: tag(item, "title"),
      subtitle: tag(item, "description").replace(/<[^>]+>/g, ""),
      url: tag(item, "link"),
      image: enclosure ? decode(enclosure[1]) : null,
      date: isNaN(date) ? null : date.toISOString(),
    };
  });
}

async function loadFeed(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "knowthetimes.com feed reader" } });
    if (!res.ok) return [];
    return parseFeed(await res.text());
  } catch {
    return [];
  }
}

export default async () => {
  const [ktt, tfr] = await Promise.all([loadFeed(FEEDS.ktt), loadFeed(FEEDS.tfr)]);
  return new Response(JSON.stringify({ ktt, tfr, updated: new Date().toISOString() }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
      "netlify-cdn-cache-control": "public, durable, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
};

export const config = { path: "/api/posts" };

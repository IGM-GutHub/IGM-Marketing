/**
 * Cybersecurity news feed, fetched at build time from established RSS sources.
 * A Netlify scheduled function triggers a rebuild weekly so this stays fresh
 * without anyone touching it. Failures are non-fatal: a dead feed is skipped
 * and the site still builds.
 */
const EleventyFetch = require("@11ty/eleventy-fetch");

const FEEDS = [
  { source: "CISA", slug: "cisa", tagline: "US Cyber Defense Agency", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml" },
  { source: "The Hacker News", slug: "thn", tagline: "Security News", url: "https://feeds.feedburner.com/TheHackersNews" },
  { source: "BleepingComputer", slug: "bleeping", tagline: "Tech & Security News", url: "https://www.bleepingcomputer.com/feed/" },
  { source: "Krebs on Security", slug: "krebs", tagline: "In-depth Reporting", url: "https://krebsonsecurity.com/feed/" },
];

const MAX_PER_SOURCE = 6;
const MAX_TOTAL = 18;

function decodeEntities(str) {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#821[12];/g, "–")
    .replace(/&#\d+;/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m ? m[1].trim() : "";
}

function parseFeed(xml, feed) {
  const items = [];
  // RSS 2.0 <item> blocks; Atom <entry> blocks as fallback
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  for (const block of blocks) {
    const title = decodeEntities(tag(block, "title"));
    let link = tag(block, "link");
    if (!link || link.startsWith("<")) {
      // Atom-style <link href="..."/>
      const m = block.match(/<link[^>]*href="([^"]+)"/i);
      link = m ? m[1] : "";
    }
    link = decodeEntities(link);
    const date = tag(block, "pubDate") || tag(block, "dc:date") || tag(block, "updated") || tag(block, "published");
    if (!title || !link || !/^https?:\/\//.test(link)) continue;
    const parsed = new Date(date);
    items.push({
      title,
      link,
      source: feed.source,
      slug: feed.slug,
      tagline: feed.tagline,
      date: isNaN(parsed) ? new Date().toISOString() : parsed.toISOString(),
    });
    if (items.length >= MAX_PER_SOURCE) break;
  }
  return items;
}

module.exports = async function () {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const xml = await EleventyFetch(feed.url, {
        duration: "1d",
        type: "text",
        fetchOptions: {
          headers: { "user-agent": "Mozilla/5.0 (compatible; IronGateSiteBuilder/1.0)" },
        },
      });
      return parseFeed(xml, feed);
    })
  );

  const all = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      all.push(...r.value);
    } else {
      console.warn(`[news] Feed failed, skipping: ${FEEDS[i].source} (${r.reason && r.reason.message})`);
    }
  });

  all.sort((a, b) => new Date(b.date) - new Date(a.date));
  console.log(`[news] Collected ${all.length} items from ${results.filter((r) => r.status === "fulfilled").length}/${FEEDS.length} feeds`);
  return all.slice(0, MAX_TOTAL);
};

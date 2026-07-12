module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  // "JUL 11, 2026" style dates for news cards
  eleventyConfig.addFilter("newsDate", (value) => {
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d
      .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" })
      .toUpperCase()
      .replace(/,/, ",");
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    const d = new Date(value);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};

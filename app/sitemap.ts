import type { MetadataRoute } from "next";

const BASE_URL = "https://aicoach.tonehouse.sg";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/start",
    "/coach",
    "/lessons",
    "/lessons/guitar",
    "/backing-tracks",
    "/ear-training",
    "/finder",
    "/progressions",
    "/metronome",
    "/tuner",
    "/signin",
    "/about",
    "/contact",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}

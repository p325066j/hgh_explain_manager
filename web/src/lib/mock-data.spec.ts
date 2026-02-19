import { describe, expect, it } from "vitest";
import { getCategories, getVideos } from "./mock-data";

describe("mock-data", () => {
  it("categories are ordered by order asc", () => {
    const categories = getCategories();
    const orders = categories.map((category) => category.order);
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
  });

  it("videos are ordered by updatedAt desc", () => {
    const videos = getVideos();
    const timestamps = videos.map((video) => new Date(video.updatedAt).getTime());
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });
});

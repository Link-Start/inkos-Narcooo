import { describe, expect, it } from "vitest";
import { buildPlayableHtml } from "../interactive-film/export-html.js";
import { StoryGraphSchema } from "../interactive-film/graph-schema.js";

const graph = StoryGraphSchema.parse({
  schemaVersion: 1, projectId: "p", title: "可玩样例", variables: [{ name: "trust", type: "counter", default: 0, desc: "" }],
  nodes: [
    { id: "s", type: "start", title: "开场", sceneDesc: "宫门前", imageSlot: { prompt: "宫门", assetRef: "interactive-films/p/assets/nodes/s.png" },
      choices: [{ id: "c", text: "去查", targetNodeId: "e", effects: [{ var: "trust", op: "add", value: 1 }] }] },
    { id: "e", type: "ending", title: "真相", choices: [] },
  ],
  endings: [{ id: "g1", nodeId: "e", title: "真相", type: "good" }],
});

describe("buildPlayableHtml", () => {
  it("is self-contained (no external http references)", () => {
    const html = buildPlayableHtml(graph);
    expect(html).toContain("<!doctype html>");
    expect(html).not.toMatch(/src=["']https?:\/\//);
    expect(html).not.toMatch(/href=["']https?:\/\//);
  });
  it("embeds the graph and a player marker", () => {
    const html = buildPlayableHtml(graph);
    expect(html).toContain("可玩样例");
    expect(html).toContain("trust"); // graph embedded
    expect(html).toMatch(/data-if-player|id="if-player"/); // player root marker
  });
  it("inlines provided asset data URIs", () => {
    const html = buildPlayableHtml(graph, { assetDataUris: { "interactive-films/p/assets/nodes/s.png": "data:image/png;base64,AAAA" } });
    expect(html).toContain("data:image/png;base64,AAAA");
  });
});

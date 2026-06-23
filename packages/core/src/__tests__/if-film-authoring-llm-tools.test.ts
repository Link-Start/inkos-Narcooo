import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createFillNodeTool } from "../agent/film-authoring-tools.js";
import { loadStoryGraph } from "../interactive-film/graph-store.js";
import { saveStoryGraph } from "../interactive-film/graph-store.js";
import { StoryGraphSchema } from "../interactive-film/graph-schema.js";

const node = JSON.stringify({ type: "branch", title: "抉择", sceneDesc: "宫门前", dialogue: [{ speaker: "阿梅", text: "账不能错", emotion: "坚定" }], choices: [{ id: "a", text: "公开", targetNodeId: "e" }] });

describe("fill_node tool (stubbed LLM)", () => {
  let root: string;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "if-llm-"));
    await mkdir(join(root, "interactive-films", "p"), { recursive: true });
    await saveStoryGraph(root, "p", StoryGraphSchema.parse({ schemaVersion: 1, projectId: "p", title: "T", variables: [], nodes: [{ id: "n1", type: "branch", choices: [] }, { id: "e", type: "ending", choices: [] }], endings: [] }));
  });
  afterEach(async () => { await rm(root, { recursive: true, force: true }); });

  it("fills a node from stubbed LLM text and persists it", async () => {
    const tool = createFillNodeTool(root, "p", { chat: async () => "```json\n" + node + "\n```" });
    await tool.execute("call-1", { nodeId: "n1", instruction: "写抉择场景" } as never);
    const g = await loadStoryGraph(root, "p");
    expect(g?.nodes.find(n => n.id === "n1")?.dialogue?.[0].speaker).toBe("阿梅");
  });
});

import { describe, expect, it } from "vitest";
import { buildView } from "../PlayHud";

describe("PlayHud buildView", () => {
  it("classifies held inventory from canonical graph edge roles, not status words", () => {
    const view = buildView({
      currentState: { turn: 1, mode: "guided", premise: "查一个配送柜。" },
      graph: {
        entities: [
          { id: "loc-cabinet", type: "location", label: "F-07配送柜", status: "就在面前" },
          { id: "blood", type: "evidence", label: "柜内血迹", status: "已看见，还未采集" },
          { id: "note", type: "clue", label: "夹层纸条", status: "正在查阅" },
        ],
        edges: [
          { id: "edge-hold-note", fromId: "actor_player", type: "拿着", toId: "note", value: { role: "holding" } },
        ],
        stateSlots: [],
        events: [],
      },
    });

    expect(view?.facing.map((row) => row.label)).toEqual([
      "F-07配送柜",
      "柜内血迹",
    ]);
    expect(view?.holdings.map((row) => row.label)).toEqual(["夹层纸条"]);
  });

  it("does not treat inventory-looking status text as authoritative", () => {
    const view = buildView({
      currentState: { turn: 1, mode: "guided", premise: "查一个配送柜。" },
      graph: {
        entities: [
          { id: "note", type: "clue", label: "夹层纸条", status: "已收起" },
        ],
        edges: [],
        stateSlots: [],
        events: [],
      },
    });

    expect(view?.facing.map((row) => row.label)).toEqual(["夹层纸条"]);
    expect(view?.holdings.map((row) => row.label)).toEqual([]);
  });

  it("does not infer holdings from relation wording alone", () => {
    const view = buildView({
      currentState: { turn: 1, mode: "guided", premise: "查一个配送柜。" },
      graph: {
        entities: [
          { id: "note", type: "clue", label: "夹层纸条", status: "正在查阅" },
        ],
        edges: [
          { id: "edge-hold-note", fromId: "actor_player", type: "持有", toId: "note" },
        ],
        stateSlots: [],
        events: [],
      },
    });

    expect(view?.facing.map((row) => row.label)).toEqual(["夹层纸条"]);
    expect(view?.holdings.map((row) => row.label)).toEqual([]);
  });

  it("uses semantic relation roles and suppresses duplicate status labels", () => {
    const view = buildView({
      currentState: { turn: 1, mode: "open", premise: "查一个旧站台。" },
      graph: {
        entities: [
          { id: "actor_player", type: "actor", label: "值班员", status: "值班员" },
          { id: "actor_guard", type: "actor", label: "站长", status: "怀疑" },
          { id: "key", type: "item", label: "旧钥匙", status: "已持有" },
        ],
        edges: [
          { id: "edge-hold-key", fromId: "actor_player", type: "持有", toId: "key", value: { role: "holding" } },
          { id: "edge-suspect", fromId: "actor_guard", type: "怀疑", toId: "actor_player", value: { role: "relation" } },
        ],
        stateSlots: [],
        events: [],
      },
    });

    const player = view?.actors.find((row) => row.id === "actor_player");
    expect(player?.note).toBeNull();
    expect(player?.details.map((detail) => detail.text)).toEqual(["怀疑 · 站长"]);
    expect(view?.holdings.map((row) => row.label)).toEqual(["旧钥匙"]);
  });
});

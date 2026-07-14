import type { ChatState } from "./types";

const EMPTY_MESSAGES: readonly [] = [];

export const chatSelectors = {
  activeSession: (s: ChatState) => (s.activeSessionId ? s.sessions[s.activeSessionId] ?? null : null),
  activeMessages: (s: ChatState) =>
    (s.activeSessionId ? s.sessions[s.activeSessionId]?.messages : undefined) ?? EMPTY_MESSAGES,
  isActiveSessionStreaming: (s: ChatState) => Boolean(s.activeSessionId && s.sessions[s.activeSessionId]?.isStreaming),
  // 聊天轮本身是否在流式中；后台任务运行期间为 false（此时仍可继续发消息）。
  isActiveSessionChatStreaming: (s: ChatState) =>
    Boolean(s.activeSessionId && s.sessions[s.activeSessionId]?.isChatStreaming),
  isEmpty: (s: ChatState) =>
    ((s.activeSessionId ? s.sessions[s.activeSessionId]?.messages.length : 0) ?? 0) === 0
    && !Boolean(s.activeSessionId && s.sessions[s.activeSessionId]?.isStreaming),
};

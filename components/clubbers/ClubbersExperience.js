"use client";

import { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
import ProfilePanel from "./ProfilePanel";
import SwipeDeck from "./SwipeDeck";
import ChatPanel from "./ChatPanel";
import MatchesPanel from "./MatchesPanel";

export default function ClubbersExperience() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeView, setActiveView] = useState("discover");
  const [chatState, setChatState] = useState({ loading: true, error: "" });

  const loadChats = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setChatState({ loading: true, error: "" });
    try {
      const response = await fetch("/api/chat/bootstrap", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load chats.");

      setChats(payload.conversations || []);
      setActiveChatId((current) =>
        payload.conversations?.some((chat) => chat.id === current)
          ? current
          : payload.conversations?.[0]?.id || null,
      );
      setChatState({ loading: false, error: "" });
    } catch (error) {
      setChatState({ loading: false, error: error.message });
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (activeView !== "chats") return undefined;
    const interval = window.setInterval(() => loadChats({ quiet: true }), 4000);
    return () => window.clearInterval(interval);
  }, [activeView, loadChats]);

  const saveVibe = useCallback(async (clubber) => {
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profileId: clubber.id,
          eventName: clubber.sharedEvent || clubber.event,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save this vibe.");
      if (!payload.conversation) return null;

      setChats((current) => {
        const withoutExisting = current.filter(
          (chat) => chat.id !== payload.conversation.id,
        );
        return [payload.conversation, ...withoutExisting];
      });
      setChatState({ loading: false, error: "" });
      return payload.conversation;
    } catch (error) {
      setChatState({ loading: false, error: error.message });
      return null;
    }
  }, []);

  const openVibeChat = useCallback(async (clubber) => {
    const conversation =
      chats.find((chat) => chat.profileId === String(clubber.id)) ||
      await saveVibe(clubber);
    if (!conversation) return;
    setActiveChatId(conversation.id);
    setActiveView("chats");
  }, [chats, saveVibe]);

  const removeVibe = useCallback(async (profileId) => {
    try {
      const response = await fetch("/api/matches", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not remove this vibe.");

      const conversations = payload.conversations || [];
      setChats(conversations);
      setActiveChatId((current) =>
        conversations.some((chat) => chat.id === current)
          ? current
          : conversations[0]?.id || null,
      );
      setChatState({ loading: false, error: "" });
      window.dispatchEvent(new Event("scenemates:matches-updated"));
      return true;
    } catch (error) {
      setChatState({ loading: false, error: error.message });
      return false;
    }
  }, []);

  const sendMessage = async (chatId, text) => {
    const cleanText = text.trim();
    if (!cleanText) return false;

    try {
      const response = await fetch(`/api/conversations/${chatId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: cleanText }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Message could not be sent.");

      setChats((current) =>
        current.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, payload.message] }
            : chat,
        ),
      );
      setChatState({ loading: false, error: "" });
      return true;
    } catch (error) {
      setChatState({ loading: false, error: error.message });
      return false;
    }
  };

  return (
    <div className="relative mx-auto min-h-[calc(100dvh-8rem)] w-full">
      <aside aria-label="Clubber tools" className="fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-white/10 bg-[#09090c]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-x-0 sm:-translate-y-1/2 sm:flex-col sm:items-stretch lg:left-8">
        <button type="button" onClick={() => setActiveView("discover")} aria-current={activeView === "discover" ? "page" : undefined} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-medium transition active:scale-[0.98] sm:w-12 lg:w-[164px] lg:justify-start lg:px-4 ${activeView === "discover" ? "border-[#a95bf4]/65 bg-[#a95bf4] text-black" : "border-transparent text-zinc-300 hover:border-white/10 hover:bg-white/[0.05]"}`}>
          <Users size={16} /><span className="hidden lg:inline">Discover</span>
        </button>
        <ChatPanel
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onSendMessage={sendMessage}
          isOpen={activeView === "chats"}
          onOpen={() => setActiveView("chats")}
          onClose={() => setActiveView("discover")}
          loading={chatState.loading}
          error={chatState.error}
          onRetry={loadChats}
        />
        <MatchesPanel
          chats={chats}
          onOpenChat={(chatId) => {
            setActiveChatId(chatId);
            setActiveView("chats");
          }}
          onUnvibe={removeVibe}
        />
        <ProfilePanel compact />
      </aside>
      {activeView === "discover" && (
        <div className="mx-auto w-full max-w-[470px]">
          <SwipeDeck onMatch={saveVibe} onMatchChat={openVibeChat} />
        </div>
      )}
      {chatState.error && activeView === "discover" && (
        <div role="status" className="fixed bottom-24 left-1/2 z-[55] w-[min(90vw,430px)] -translate-x-1/2 rounded-xl border border-red-400/20 bg-[#171116] px-4 py-3 text-center text-xs text-red-200 sm:bottom-6">
          {chatState.error}
        </div>
      )}
    </div>
  );
}

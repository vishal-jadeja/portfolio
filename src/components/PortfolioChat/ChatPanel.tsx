"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import type { ChatStatus } from "ai";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import StarterQuestions from "./StarterQuestions";

interface Props {
  messages: UIMessage[];
  status: ChatStatus;
  input: string;
  onInputChange: (val: string) => void;
  onSend: (text: string) => void;
  onClose: () => void;
  onClear: () => void;
}

const timestampCache = new Map<string, Date>();

function getTimestamp(id: string): Date {
  if (!timestampCache.has(id)) timestampCache.set(id, new Date());
  return timestampCache.get(id)!;
}

export default function ChatPanel({
  messages,
  status,
  input,
  onInputChange,
  onSend,
  onClose,
  onClear,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
    onInputChange(el.value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  return (
    <div className="h-[580px] max-h-[calc(100vh-110px)] flex flex-col relative bg-transparent pointer-events-auto backdrop-blur-[4px]">

      {/* Header */}
      <div className="flex items-center justify-between gap-2.5 px-4 py-3.5 border-b border-[var(--theme-border-main)] flex-shrink-0 relative z-[1] bg-[var(--theme-card)]">
        <div className="flex items-center gap-2.5">
          {/* Text */}
          <div className="flex flex-col gap-px">
            <span className="text-[13px] font-semibold text-[var(--theme-text-main)] tracking-[-0.01em] leading-[1.2]">
              Vishal&apos;s AI
            </span>
            <span className="text-[10px] text-[#22c55e] font-mono tracking-[0.05em] opacity-90">
              ● Always Online
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-[5px]">
          <button
            className="w-7 h-7 bg-transparent border border-transparent rounded-lg text-[var(--theme-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-white/[0.06] hover:border-[var(--theme-border-main)] hover:text-[var(--theme-text-main)] hover:scale-[1.08] active:scale-[0.94]"
            onClick={onClear}
            title="Clear chat"
            aria-label="Clear chat history"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </button>
          <button
            className="w-7 h-7 bg-transparent border border-transparent rounded-lg text-[var(--theme-text-muted)] cursor-pointer flex items-center justify-center transition-all duration-150 hover:bg-white/[0.06] hover:border-[var(--theme-border-main)] hover:text-[var(--theme-text-main)] hover:scale-[1.08] active:scale-[0.94]"
            onClick={onClose}
            title="Close"
            aria-label="Close chat"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-1.5 flex flex-col gap-2.5 scroll-smooth overscroll-contain backdrop-blur-[10px] bg-[rgb(0, 0, 0, 0.25)] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/[0.08] [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb:hover]:bg-white/[0.14]">
        {messages.length === 0 ? (
          <StarterQuestions onSelect={onSend} disabled={isLoading} />
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              timestamp={getTimestamp(msg.id)}
            />
          ))
        )}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-[13px] py-3 pb-3.5 border-t border-[var(--theme-border-main)] bg-black/90">
        <div className="flex items-end gap-2 bg-white/[0.04] border border-[var(--theme-border-main)] rounded-[13px] pt-[7px] pr-[7px] pb-[7px] pl-[13px] transition-all duration-200 focus-within:border-white/15 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]">
          <textarea
            ref={textareaRef}
            className="flex-1 resize-none border-none bg-transparent text-[var(--theme-text-main)] font-[inherit] text-[13.5px] leading-[1.5] py-[3px] min-h-[22px] max-h-[100px] outline-none self-center tracking-[-0.005em] placeholder:text-[var(--theme-text-muted)] placeholder:opacity-40 disabled:opacity-35 disabled:cursor-not-allowed"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Message Vishal's AI..."
            disabled={isLoading}
            rows={1}
          />
          <button
            className="w-8 h-8 bg-[var(--theme-text-main)] border-none rounded-[9px] text-[var(--theme-bg)] cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_2px_10px_rgba(0,0,0,0.25),0_1px_0_rgba(255,255,255,0.12)_inset] hover:not-disabled:scale-110 hover:not-disabled:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.15)_inset] active:not-disabled:scale-[0.92] disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-white/10 disabled:text-[var(--theme-text-muted)]"
            onClick={submit}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

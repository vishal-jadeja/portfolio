"use client";

const QUESTIONS = [
  "What's your tech stack?",
  "Tell me about Cadenz",
  "Are you open to work?",
  "What are you learning?",
  "What's your favorite IPL team?",
];

interface Props {
  onSelect: (question: string) => void;
  disabled: boolean;
}

export default function StarterQuestions({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-col gap-[18px] px-1 py-2 h-full justify-center">
      <div className="flex flex-col gap-[5px]">
        <p className="text-[18px] font-bold text-[var(--theme-text-main)] tracking-[-0.02em] leading-[1.3]">
          Hey there 👋
        </p>
        <p className="text-[11px] font-mono text-[var(--theme-text-muted)] tracking-[0.06em] uppercase opacity-70">
          Ask me anything about Vishal →
        </p>
      </div>
      <div className="flex flex-col gap-1.5">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            className="bg-transparent border border-[var(--theme-border-main)] rounded-[10px] px-3.5 py-2.5 text-[12.5px] font-[450] text-[var(--theme-text-muted)] cursor-pointer text-left font-[inherit] flex items-center justify-between tracking-[-0.005em] transition-all duration-150 hover:bg-white/[0.04] hover:border-white/12 hover:text-[var(--theme-text-main)] hover:translate-x-0.5 disabled:opacity-35 disabled:cursor-not-allowed disabled:translate-x-0 group"
            onClick={() => onSelect(q)}
            disabled={disabled}
          >
            {q}
            <span className="text-[11px] opacity-0 -translate-x-1 translate-y-1 transition-all duration-150 flex-shrink-0 group-hover:opacity-60 group-hover:translate-x-0 group-hover:translate-y-0">
              ↗
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

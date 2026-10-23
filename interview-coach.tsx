"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import { Loader2, SendHorizontal, BrainCircuit, RotateCcw } from "lucide-react";

export function InterviewCoach() {
  const [role, setRole] = useState("");
  const [started, setStarted] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } =
    useChat({ api: "/api/ai/interview" });

  const startSession = () => {
    if (!role.trim()) return;
    setStarted(true);
    // Seed first message
    handleSubmit(
      { preventDefault: () => {} } as React.FormEvent,
      {
        data: {
          systemContext: `You are an expert interview coach helping a candidate prepare for a ${role} role. Ask one behavioural or technical interview question at a time, wait for their answer, give specific feedback (what was good, what to improve), then ask the next question. Start by introducing yourself briefly and asking the first question.`,
        },
      }
    );
  };

  const reset = () => { setStarted(false); setRole(""); setMessages([]); };

  const inputClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (!started) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <BrainCircuit className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Start Interview Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the role you&apos;re interviewing for and we&apos;ll run a practice session.
          </p>
        </div>
        <div className="mx-auto max-w-sm space-y-3">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Product Manager at Spotify"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && startSession()}
          />
          <button
            onClick={startSession}
            disabled={!role.trim()}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <BrainCircuit className="h-4 w-4" />
            Begin Practice Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Interview Coach · {role}</span>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5 min-h-96 max-h-[480px]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-3 border-t border-border p-4"
      >
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your answer…"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as unknown as React.FormEvent);
            }
          }}
          className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Users, Calendar, Briefcase, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { askXploreAi } from "@/lib/api/platform.functions";
import { useSession } from "@/lib/use-session";

const suggestions = [
  "Recommend a club based on my interests",
  "Find an upcoming hackathon or tech event",
  "Show internships matching my skills",
  "What opportunities are available for remote work?",
];

type Message = {
  role: "user" | "ai";
  text: string;
  clubs?: any[];
  events?: any[];
  opportunities?: any[];
};

export function AskXploreAI() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const session = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(nextPrompt = prompt) {
    if (!nextPrompt.trim()) return;
    setError("");
    if (!session) {
      setError("Sign in to use Xplore AI.");
      return;
    }

    const userMessage: Message = { role: "user", text: nextPrompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        text: m.text,
      }));

      const result = await askXploreAi({
        data: {
          token: session.token,
          prompt: nextPrompt,
          history,
        },
      });

      const aiMessage: Message = {
        role: "ai",
        text: result.answer,
        clubs: result.clubs,
        events: result.events,
        opportunities: result.opportunities,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
  }

  return (
    <>
      <button
        aria-label="Ask Xplore AI"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 md:bottom-6 md:right-6 z-40 group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-3 pr-4 py-3 shadow-elevated hover:opacity-90 transition"
      >
        <span className="h-7 w-7 rounded-full bg-accent-gold grid place-items-center text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold hidden sm:inline">Ask Xplore AI</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-full sm:w-[440px] bg-card border-l border-border shadow-elevated flex flex-col animate-fade-up">
            {/* Header */}
            <header className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
              <span className="h-9 w-9 rounded-full bg-primary grid place-items-center text-primary-foreground">
                <Sparkles className="h-4 w-4 text-accent-gold" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold">Xplore AI</div>
                <div className="text-xs text-muted-foreground">Powered by Gemini · Campus Copilot</div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button onClick={clearChat} className="h-8 px-2 rounded-full hover:bg-secondary text-xs text-muted-foreground font-medium">
                    Clear
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full hover:bg-secondary grid place-items-center">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Welcome */}
              {messages.length === 0 && (
                <>
                  <div className="rounded-2xl rounded-tl-sm bg-primary-soft text-foreground p-4 text-sm max-w-[90%]">
                    <p>Hi <strong>{session?.user.name.split(" ")[0] ?? "there"}</strong>! 👋 I'm XploreAI, your campus copilot.</p>
                    <p className="mt-1.5">I know all about NIT Jalandhar's clubs, events and opportunities. Ask me anything!</p>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Try asking</div>
                    <div className="space-y-2">
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => void ask(s)}
                          className="w-full text-left text-sm rounded-xl border border-border px-3.5 py-2.5 hover:border-primary/40 hover:bg-primary-soft/40 transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Conversation */}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {msg.role === "user" ? (
                    <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground p-3.5 text-sm max-w-[85%]">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="max-w-[90%] space-y-3">
                      <div className="rounded-2xl rounded-tl-sm bg-secondary border border-border p-4 text-sm whitespace-pre-wrap">
                        {msg.text}
                      </div>

                      {/* Result cards */}
                      {(msg.clubs?.length ?? 0) > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                            <Users className="h-3 w-3" /> Clubs
                          </div>
                          {msg.clubs!.map((c) => (
                            <Link key={c.id} to="/clubs/$clubId" params={{ clubId: c.id }} onClick={() => setOpen(false)} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:bg-primary-soft/30 transition">
                              {c.image ? <img src={c.image} alt={c.name} className="h-8 w-8 rounded-lg object-cover shrink-0" /> : <div className="h-8 w-8 rounded-lg bg-primary-soft shrink-0" />}
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">{c.name}</div>
                                <div className="text-[10px] text-muted-foreground">{c.members} members</div>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {(msg.events?.length ?? 0) > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Events
                          </div>
                          {msg.events!.map((e) => (
                            <Link key={e.id} to="/events/$eventId" params={{ eventId: e.id }} onClick={() => setOpen(false)} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:bg-primary-soft/30 transition">
                              {e.image ? <img src={e.image} alt={e.name} className="h-8 w-8 rounded-lg object-cover shrink-0" /> : <div className="h-8 w-8 rounded-lg bg-primary-soft shrink-0" />}
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">{e.name}</div>
                                <div className="text-[10px] text-muted-foreground">{e.date} · {e.fee}</div>
                              </div>
                              <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {(msg.opportunities?.length ?? 0) > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> Opportunities
                          </div>
                          {msg.opportunities!.map((o) => (
                            <div key={o.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border">
                              {o.image ? <img src={o.image} alt={o.org} className="h-8 w-8 rounded-lg object-cover shrink-0" /> : <div className="h-8 w-8 rounded-lg bg-accent-gold-soft shrink-0" />}
                              <div className="min-w-0">
                                <div className="text-xs font-semibold truncate">{o.title}</div>
                                <div className="text-[10px] text-muted-foreground">{o.org} · {o.stipend}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="rounded-2xl rounded-tl-sm bg-secondary border border-border p-4 flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Xplore AI is thinking...</span>
                  </div>
                </div>
              )}

              {error && <div className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm">{error}</div>}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void ask();
                }}
                className="relative"
              >
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask about clubs, events or opportunities..."
                  disabled={loading}
                  className="w-full h-12 pl-4 pr-12 rounded-full bg-secondary border border-border text-sm placeholder:text-muted-foreground/80 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                />
                <button
                  disabled={loading || !prompt.trim()}
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {!session && (
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  <Link to="/auth" className="text-primary font-semibold">Sign in</Link> to use Xplore AI
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

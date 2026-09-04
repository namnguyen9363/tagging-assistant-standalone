// Copied from TAG WISE (tag-wise-fe/src/features/TaggingAssistant/TaggingAssistant.tsx).
// Only the data import changed (local ./api instead of the TAG WISE axios client) —
// everything else, including all styling, is unchanged so the UI renders identically.
import { SendOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiRagAsk } from "./api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatSource {
  document: string;
  page: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  isError?: boolean;
}

const EXAMPLE_PROMPTS = [
  "What's the process to extend a rule's date range?",
  "When should we use custom code instead of an extension?",
  "What's the rule naming policy?",
];

let idSeq = 0;
const nextId = () => `msg-${Date.now()}-${idSeq++}`;

// ─── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isUser
              ? "var(--radius-md) var(--radius-md) 4px var(--radius-md)"
              : "var(--radius-md) var(--radius-md) var(--radius-md) 4px",
            background: isUser
              ? "var(--info)"
              : message.isError
              ? "rgba(255,59,48,0.08)"
              : "var(--surface-2)",
            color: isUser ? "#fff" : message.isError ? "var(--fail)" : "var(--text)",
            border: isUser ? "none" : "1px solid var(--border)",
            fontSize: 14,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.content}
        </div>

        {!!message.sources?.length && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: "4px 2px 0",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.3px" }}>
              SOURCES
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {message.sources.map((src, i) => (
                <span
                  key={`${src.document}-${src.page}-${i}`}
                  style={{
                    fontSize: 12,
                    color: "var(--text-3)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    padding: "2px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {src.document} · page {src.page}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Typing indicator ──────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "var(--radius-md) var(--radius-md) var(--radius-md) 4px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="tw-skeleton"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--text-3)",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const TaggingAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (question?: string) => {
    const trimmed = (question ?? input).trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { id: nextId(), role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiRagAsk(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: res?.answer || "No answer was returned.",
          sources: res?.sources || [],
        },
      ]);
    } catch {
      toast.error("Failed to get an answer. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: "Something went wrong while fetching the answer. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        height: "100%",
        padding: "32px 24px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          display: "flex",
          flexDirection: "column",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Tagging Assistant</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            Ask a question about tagging — answers come from the tagging knowledge base
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
                color: "var(--text-3)",
              }}
            >
              <div style={{ fontSize: 14 }}>No messages yet — try asking:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 480 }}>
                {EXAMPLE_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 14,
                      color: "var(--text-2)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {loading && <TypingBubble />}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: 12,
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            className="tw-textarea"
            style={{ height: 42, minHeight: 42, resize: "none", fontSize: 14 }}
            placeholder="Ask a tagging question… (Enter to send, Shift+Enter for a new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="tw-btn-primary"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <SendOutlined />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaggingAssistant;

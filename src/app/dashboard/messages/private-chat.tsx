"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = { id: string; senderId: string; recipientId: string; body: string; readAt: string | null; createdAt: string };

function messageTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCFullYear()).slice(-2)}, ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} UTC`;
}

export function PrivateChat({ userId, partnerId, partnerName, initialMessages }: { userId: string; partnerId: string; partnerName: string; initialMessages: ChatMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  useEffect(() => {
    let active = true;
    async function refresh() {
      const response = await fetch(`/api/messages?with=${partnerId}`, { cache: "no-store" });
      if (!response.ok || !active) return;
      const data = await response.json();
      setMessages(data.messages || []);
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [partnerId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true); setError("");
    const optimistic: ChatMessage = { id: `pending-${Date.now()}`, senderId: userId, recipientId: partnerId, body: text, readAt: null, createdAt: new Date().toISOString() };
    setMessages((current) => [...current, optimistic]); setBody("");
    try {
      const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientId: partnerId, body: text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo enviar el mensaje.");
      setMessages((current) => current.map((message) => message.id === optimistic.id ? data.message : message));
    } catch (caught) {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setBody(text); setError(caught instanceof Error ? caught.message : "No se pudo enviar el mensaje.");
    } finally { setSending(false); }
  }

  return <div className="panel conversation"><div className="chat-head"><span className="avatar">{partnerName.slice(0, 2).toUpperCase()}</span><div><h2>{partnerName}</h2><small>Canal privado · actualización automática</small></div></div><div className="message-thread" aria-live="polite">{messages.length ? messages.map((message) => <div className={message.senderId === userId ? "message mine" : "message"} key={message.id}><p>{message.body}</p><small>{messageTime(message.createdAt)}{message.senderId === userId ? message.readAt ? " · Leído" : " · Enviado" : ""}</small></div>) : <div className="empty"><b>Conversación privada</b><p>Escribe la primera pregunta o actualización.</p></div>}<div ref={endRef}/></div><form className="message-form" onSubmit={submit}><label className="sr-only" htmlFor="chat-message">Mensaje</label><textarea id="chat-message" value={body} maxLength={2000} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} required placeholder={`Escribe a ${partnerName}…`}/><button className="button" type="submit" disabled={sending || !body.trim()}>{sending ? "Enviando…" : "Enviar"}</button>{error && <p className="chat-error">{error}</p>}<small className="chat-hint">Enter para enviar · Shift + Enter para nueva línea</small></form></div>;
}

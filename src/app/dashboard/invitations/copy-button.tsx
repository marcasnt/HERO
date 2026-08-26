"use client";

import { useState } from "react";

export function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="mini-button" type="button" onClick={async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copiado ✓" : "Copiar enlace"}</button>;
}

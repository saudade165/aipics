"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#09090c", color: "#eeeef3", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>The application failed to load</h1>
          <p style={{ color: "#a0a0b0", fontSize: 14 }}>Please try again. If the problem persists, check the server logs.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", borderRadius: 8, border: "1px solid #333", background: "#1e1e27", color: "inherit", cursor: "pointer" }}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}

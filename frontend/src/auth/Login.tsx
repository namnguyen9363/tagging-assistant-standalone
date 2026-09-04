// Adapted from TAG WISE (tag-wise-fe/src/pages/LoginPage.tsx). Same auth logic
// (useAuth0().loginWithRedirect()) — only the markup/styling changed, to this app's
// own CSS-variable design system (see index.css) instead of TAG WISE's Tailwind
// classes, and the appState.returnTo was dropped since this app has no router/routes
// to return to (a single screen).
import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 40 }}>🏷️</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)" }}>
        Tagging Assistant
      </div>
      <div style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 360 }}>
        Sign in to ask questions about Adobe Launch rules, ssGTM, and tagging policy.
      </div>
      <button className="tw-btn-primary" onClick={() => loginWithRedirect()} style={{ marginTop: 8 }}>
        Login
      </button>
    </div>
  );
}

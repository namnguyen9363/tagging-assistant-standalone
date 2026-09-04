import { useAuth0 } from "@auth0/auth0-react";
import { Toaster } from "react-hot-toast";
import Login from "./auth/Login";
import TaggingAssistant from "./TaggingAssistant";

// Same gate condition as TAG WISE's HomePage.tsx (isAuthenticated && user) —
// adapted to render inline instead of <Navigate> since this app has no router.
function AuthGate() {
  const { isLoading, isAuthenticated, user } = useAuth0();

  if (isLoading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>Loading…</span>
      </div>
    );
  }

  const isUser = isAuthenticated && user;
  return isUser ? <TaggingAssistant /> : <Login />;
}

function App() {
  return (
    <>
      <AuthGate />
      <Toaster
        position="bottom-right"
        containerStyle={{ margin: "25px" }}
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 5000 },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
          },
        }}
      />
    </>
  );
}

export default App;

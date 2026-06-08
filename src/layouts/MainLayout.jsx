import { Outlet, useLocation } from "react-router-dom";
import { ChatPanel } from "../components/chat/ChatPanel.jsx";
import { Footer } from "../components/common/Footer.jsx";
import { Navbar } from "../components/common/Navbar.jsx";
import { PageTransition } from "../components/ui/PageTransition.jsx";

export function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isChat = location.pathname === "/chat";

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className={`mx-auto w-full max-w-7xl flex-1 px-4 lg:px-6 ${isHome ? "pt-0" : "py-8"} ${isChat ? "px-0 lg:px-6" : ""}`}>
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      {!isChat && <ChatPanel />}
      <Footer />
    </div>
  );
}

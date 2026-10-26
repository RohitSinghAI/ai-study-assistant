
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import RightPanel from "./components/RightPanel";

export default function App() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documentId, setDocumentId] = useState(null);

  function handleNewChat() {
    setChatId(null);
    setMessages([]);
    setDocumentId(null);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar
        chatId={chatId}
        setChatId={setChatId}
        setMessages={setMessages}
        onNewChat={handleNewChat}
      />

      <main className="flex min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <ChatWindow
            chatId={chatId}
            setChatId={setChatId}
            messages={messages}
            setMessages={setMessages}
            documentId={documentId}
            setDocumentId={setDocumentId}
          />
        </div>

        <div className="hidden w-72 shrink-0 border-l border-slate-800 xl:block">
          <RightPanel />
        </div>
      </main>
    </div>
  );
}

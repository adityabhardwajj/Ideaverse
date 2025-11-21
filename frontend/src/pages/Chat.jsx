import React, { useState } from "react";
import { motion } from "framer-motion";
import ChatList from "../components/ChatList";
import ChatRoom from "../components/ChatRoom";

export default function Chat() {
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  return (
    <div className="page-transition">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Messages
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Connect and collaborate with your team
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ChatList onSelectRoom={setSelectedRoomId} />
        </div>
        <div className="md:col-span-2 hidden md:block">
          {selectedRoomId ? (
            <ChatRoom roomId={selectedRoomId} onClose={() => setSelectedRoomId(null)} />
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Select a chat room to start messaging
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedRoomId && (
        <div className="md:hidden">
          <ChatRoom roomId={selectedRoomId} onClose={() => setSelectedRoomId(null)} />
        </div>
      )}
    </div>
  );
}


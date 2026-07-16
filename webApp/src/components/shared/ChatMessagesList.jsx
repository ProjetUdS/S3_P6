// src/components/shared/ChatMessagesList.jsx
import React from 'react';
import { MessageGroup } from './MessageGroup';

export function ChatMessagesList({
  messages,
  isOwn,
  getRelativeTime,
  hoveredMsgId,
  setHoveredMsgId,
  menuMsgId,
  setMenuMsgId,
  handleDelete,
  getSender,
  emptyState,
  isLoading,
  fichiers,
}) {
  if (isLoading && messages.length === 0) {
    return <div className="loading-spinner" style={{ margin: '40px auto' }} />;
  }

  if (messages.length === 0) {
    return emptyState || (
      <div className="empty-state" style={{ margin: '40px auto' }}>
        <span className="empty-state-icon">💬</span>
        <span className="empty-state-text">No messages yet</span>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg, i) => {
        const prevMsg = messages[i - 1];
        const showDay = i === 0 || msg.day !== prevMsg.day;
        const sender = getSender?.(msg) || {};
        return (
          <MessageGroup
            key={msg.id}
            msg={msg}
            sender={sender}
            own={isOwn(msg)}
            relativeTime={getRelativeTime(msg)}
            menuOpen={menuMsgId === msg.id}
            showDay={showDay}
            onHover={() => setHoveredMsgId(msg.id)}
            onHoverOut={() => setHoveredMsgId(null)}
            onMenuToggle={(e) => {
              e.stopPropagation();
              setMenuMsgId(menuMsgId === msg.id ? null : msg.id);
            }}
            onDelete={() => handleDelete(msg.id)}
            fichiers={msg.fichiers}
          />
        );
      })}
      <div className="messages-spacer" />
    </>
  );
}

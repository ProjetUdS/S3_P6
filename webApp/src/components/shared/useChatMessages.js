// src/components/shared/useChatMessages.js
import { useState, useEffect, useRef } from 'react';
import { deleteMessage } from '../../services/api';

export function useChatMessages(myCip, messagesAreaRef) {
  const [messages, setMessages] = useState([]);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [menuMsgId, setMenuMsgId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const prevMessagesRef = useRef(0);

  useEffect(() => {
    if (messagesAreaRef?.current && messages.length !== prevMessagesRef.current) {
      prevMessagesRef.current = messages.length;
      setTimeout(() => {
        const el = messagesAreaRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      }, 50);
    }
  }, [messages, messagesAreaRef]);

  useEffect(() => {
    if (!menuMsgId) return;
    const handler = () => setMenuMsgId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [menuMsgId]);

  const isOwn = msg => msg.from === myCip;

  function getRelativeTime(msg) {
    const msgDate = new Date(msg.dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (msgDate.toDateString() === today.toDateString()) {
      return timeStr;
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${timeStr}`;
    } else {
      const dateStr = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr}, ${timeStr}`;
    }
  }

  function transformMessages(data) {
    return (data || []).sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => {
      const msgDate = new Date(m.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let day = null;
      if (msgDate.toDateString() === today.toDateString()) day = 'Today';
      else if (msgDate.toDateString() === yesterday.toDateString()) day = 'Yesterday';

      return {
        id: m.id,
        from: m.cip,
        day,
        text: m.contenu,
        time: msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateStr: m.date,
        fichiers: m.fichiers || [],
      };
    });
  }

  async function handleDelete(msgId) {
    setMenuMsgId(null);
    setConfirmDelete(msgId);
  }

  async function confirmDeleteMessage() {
    if (!confirmDelete) return;
    try {
      await deleteMessage(confirmDelete);
      setMessages(prev => prev.filter(m => m.id !== confirmDelete));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
    setConfirmDelete(null);
  }

  function cancelDelete() {
    setConfirmDelete(null);
  }

  return {
    messages,
    setMessages,
    hoveredMsgId,
    setHoveredMsgId,
    menuMsgId,
    setMenuMsgId,
    confirmDelete,
    isOwn,
    getRelativeTime,
    transformMessages,
    handleDelete,
    confirmDeleteMessage,
    cancelDelete,
  };
}

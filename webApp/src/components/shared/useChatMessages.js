import { useState, useEffect, useRef } from 'react';
import { deleteMessage } from '../../services/api';

export function useChatMessages(myCip, messagesAreaRef) {
    const [messages, setMessages] = useState([]);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);
    const [menuMsgId, setMenuMsgId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const prevMessagesRef = useRef(0);
    const wsRef = useRef(null);
    const retryRef = useRef(null);
    const retryCount = useRef(0);
    const cleanupRef = useRef(false);

    useEffect(() => {
        if (messagesAreaRef?.current && messages.length !== prevMessagesRef.current) {
            prevMessagesRef.current = messages.length;
            setTimeout(() => {
                const el = messagesAreaRef.current;
                if (el) el.scrollTop = el.scrollHeight;
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
        if (msgDate.toDateString() === today.toDateString()) return timeStr;
        if (msgDate.toDateString() === yesterday.toDateString()) return `Yesterday, ${timeStr}`;
        const dateStr = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        return `${dateStr}, ${timeStr}`;
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

    function appendMessage(data) {
        const msgDate = new Date(data.date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        let day = null;
        if (msgDate.toDateString() === today.toDateString()) day = 'Today';
        else if (msgDate.toDateString() === yesterday.toDateString()) day = 'Yesterday';

        const newMsg = {
            id: data.messageId,
            from: data.cip,
            day,
            text: data.contenu || '',
            time: msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateStr: data.date,
            fichiers: [],
        };

        setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg].sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));
        });
    }

    function connectWebSocket(discussionId, friendCip, token, isActiveConversation, onNotif) {
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
        cleanupRef.current = false;
        retryCount.current = 0;

        function connect() {
            if (cleanupRef.current) return;
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const baseUrl = `${protocol}//${host}/ws/message/${discussionId}`;
            const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                retryCount.current = 0;
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'messageReceived') {
                        if (isActiveConversation()) {
                            appendMessage(data);
                        } else {
                            onNotif?.();
                        }
                    }
                } catch (err) {
                    console.error('WebSocket message error:', err);
                }
            };

            ws.onopen = () => { retryCount.current = 0; };
            ws.onerror = () => {};
            ws.onclose = () => {
                if (cleanupRef.current) return;
                const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
                retryCount.current++;
                retryRef.current = setTimeout(connect, delay);
            };
        }

        connect();

        return () => {
            cleanupRef.current = true;
            if (retryRef.current) clearTimeout(retryRef.current);
            if (wsRef.current) wsRef.current.close();
            wsRef.current = null;
        };
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

    function cancelDelete() { setConfirmDelete(null); }

    return {
        messages, setMessages,
        hoveredMsgId, setHoveredMsgId,
        menuMsgId, setMenuMsgId,
        confirmDelete,
        isOwn, getRelativeTime, transformMessages,
        handleDelete, confirmDeleteMessage, cancelDelete,
        connectWebSocket,
    };
}

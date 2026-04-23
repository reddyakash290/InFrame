/* 
  Signals (Messages) — Real-Time Interaction Logic
  Connected to FastAPI via REST and WebSockets.
*/

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesArea = document.getElementById('messagesArea');
    const signalsScroll = document.querySelector('.signals-scroll');
    const threadHeaderName = document.querySelector('.thread-header h3');
    const threadHeaderAvatar = document.querySelector('.active-avatar');

    let activeUserId = null;
    let socket = null;

    // 1. FETCH LIVE CONVERSATIONS (REST)
    async function loadConversations() {
        try {
            const conversations = await apiCall('/messages/conversations');
            signalsScroll.innerHTML = ''; // Clear hardcoded signals

            conversations.forEach((conv, index) => {
                const item = document.createElement('div');
                item.className = `signal-item ${index === 0 ? 'active' : ''}`;
                item.dataset.userId = conv.user_id;

                // If first item, set as active
                if (index === 0) {
                    activeUserId = conv.user_id;
                    updateHeader(conv.name, conv.name[0]);
                    loadChatHistory(conv.user_id);
                }

                item.innerHTML = `
                    <div class="item-avatar" style="background: ${conv.avatar_color || 'var(--accent)'}">${conv.name[0]}</div>
                    <div class="item-info">
                        <div class="item-top">
                            <span class="item-name">${conv.name}</span>
                            <span class="item-time">${conv.last_signal_time || ''}</span>
                        </div>
                        <div class="item-last">${conv.last_message || 'No signals yet'}</div>
                    </div>
                `;

                item.addEventListener('click', () => switchConversation(item, conv));
                signalsScroll.appendChild(item);
            });

            // Start WebSockets after loading conversations
            connectWebSocket();

        } catch (error) {
            console.error("Failed to load conversations:", error);
            signalsScroll.innerHTML = '<p style="padding: 20px; font-size: 11px; color: var(--text-muted);">Signals offline...</p>';
        }
    }

    // 2. FETCH CHAT HISTORY (REST)
    async function loadChatHistory(userId) {
        try {
            const history = await apiCall(`/messages/${userId}`);
            messagesArea.innerHTML = '';

            history.forEach(msg => {
                renderMessage(msg.content, msg.is_sent ? 'msg-sent' : 'msg-received');
            });

            scrollToBottom();
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    }

    function switchConversation(item, conv) {
        document.querySelectorAll('.signal-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        activeUserId = conv.user_id;
        updateHeader(conv.name, conv.name[0]);
        loadChatHistory(conv.user_id);
    }

    function updateHeader(name, avatarChar) {
        threadHeaderName.textContent = name;
        threadHeaderAvatar.textContent = avatarChar;
    }

    // 3. REAL-TIME WEBSOCKETS
    function connectWebSocket() {
        const token = localStorage.getItem('frame_token');
        if (!token) return;

        // Establish connection
        socket = new WebSocket(`ws://localhost:8000/ws/messages?token=${token}`);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // If the message is from our currently active chat, render it instantly
            if (data.sender_id === activeUserId) {
                renderMessage(data.content, 'msg-received');
                scrollToBottom();
            }
            
            // Optionally: Update the sidebar preview
            updateSidebarPreview(data.sender_id, data.content);
        };

        socket.onclose = () => {
            console.log("WebSocket connection lost. Reconnecting in 5s...");
            setTimeout(connectWebSocket, 5000);
        };
    }

    // 4. SENDING MESSAGES
    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !activeUserId) return;

        // Backend preferred: Either send via WebSocket or POST
        // We'll try WebSocket first for real-time speed
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                receiver_id: activeUserId,
                content: text
            }));
            
            // Optimistic render
            renderMessage(text, 'msg-sent');
            messageInput.value = '';
            scrollToBottom();
        } else {
            // Fallback to REST if WebSocket is down
            try {
                await apiCall('/messages', 'POST', {
                    receiver_id: activeUserId,
                    content: text
                });
                renderMessage(text, 'msg-sent');
                messageInput.value = '';
                scrollToBottom();
            } catch (error) {
                console.error("Signal failed to transmit:", error);
            }
        }
    }

    // UI Helpers
    function renderMessage(text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('msg', type);
        msgDiv.textContent = text;
        messagesArea.appendChild(msgDiv);
    }

    function scrollToBottom() {
        messagesArea.scrollTo({
            top: messagesArea.scrollHeight,
            behavior: 'smooth'
        });
    }

    function updateSidebarPreview(userId, text) {
        const item = document.querySelector(`.signal-item[data-user-id="${userId}"]`);
        if (item) {
            item.querySelector('.item-last').textContent = text;
            item.querySelector('.item-time').textContent = 'Just now';
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initial Load
    loadConversations();
});

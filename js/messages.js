/* Signals (Messages) — Interaction Logic */

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const messagesArea = document.getElementById('messagesArea');
    const signalItems = document.querySelectorAll('.signal-item');

    // Handle Sending Messages
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('msg', 'msg-sent');
        msgDiv.textContent = text;

        // Append and scroll
        messagesArea.appendChild(msgDiv);
        messageInput.value = '';
        
        // Smooth scroll to bottom
        setTimeout(() => {
            messagesArea.scrollTo({
                top: messagesArea.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Toggle Active Conversation and Z-Axis Depth
    signalItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from others
            signalItems.forEach(i => i.classList.remove('active'));
            
            // Set current as active
            item.classList.add('active');

            // Optional: Update header name/avatar based on selection
            const name = item.querySelector('.item-name').textContent;
            const avatar = item.querySelector('.item-avatar').textContent;
            document.querySelector('.thread-header h3').textContent = name;
            document.querySelector('.active-avatar').textContent = avatar;

            // Clear area for "new" chat (mock)
            messagesArea.innerHTML = `
                <div class="msg msg-received">Hey! I saw your recent work on Frame. Really impressive cinematography.</div>
                <div class="msg msg-sent">Thanks, ${name}! Much appreciated. Are you working on any new projects?</div>
                <div class="msg msg-received">Actually yes, we're looking for a DOP for a short film next month. Interested?</div>
            `;
        });
    });
});

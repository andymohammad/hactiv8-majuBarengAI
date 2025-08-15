const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const sendBtn = document.getElementById('send-btn');

const conversationHistory = [];

// Function to auto-resize textarea
input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
});

const handleChat = async () => {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // 1. Add user message to chat and history
    appendMessage('outgoing', userMessage);
    conversationHistory.push({ role: 'user', content: userMessage });
    input.value = '';
    input.style.height = 'auto'; // Reset height after sending

    // 2. Show the loading animation
    showLoadingAnimation();

    try {
        // 3. Send the entire conversation history to the backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: conversationHistory }),
        });

        // 4. Remove the loading animation
        removeLoadingAnimation();

        if (!response.ok) {
            throw new Error('Maaf, terjadi kesalahan. Bot tidak dapat merespons.');
        }

        const data = await response.json();
        const botMessage = data.result;

        // 5. Add bot response to chat and history
        appendMessage('incoming', botMessage);
        conversationHistory.push({ role: 'model', content: botMessage });

    } catch (error) {
        removeLoadingAnimation();
        console.error('Error:', error);
        appendMessage('incoming', error.message);
    }
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleChat();
});

// Allow sending with Enter key, but new line with Shift+Enter
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChat();
    }
});


function createMessageElement(type, text) {
    const li = document.createElement('li');
    li.classList.add('message', type);
    
    let content = '';
    if (type === 'outgoing') {
        content = `<p>${text}</p><i class='bx bxs-user avatar'></i>`;
    } else {
        content = `<i class='bx bxs-bot avatar'></i><p>${text}</p>`;
    }
    li.innerHTML = content;
    return li;
}

function appendMessage(type, text) {
    const messageElement = createMessageElement(type, text);
    chatBox.appendChild(messageElement);
    chatBox.scrollTo(0, chatBox.scrollHeight);
}

function showLoadingAnimation() {
    const li = document.createElement('li');
    li.id = 'loading-indicator';
    li.classList.add('message', 'incoming');
    li.innerHTML = `
        <i class='bx bxs-bot avatar'></i>
        <p class="loading">
            <span></span><span></span><span></span>
        </p>
    `;
    chatBox.appendChild(li);
    chatBox.scrollTo(0, chatBox.scrollHeight);
}

function removeLoadingAnimation() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

/* 
  Airlock — Auth Logic & Backend Wiring
  Handles login/signup toggles and FastAPI communication.
*/

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const authToggle = document.getElementById('authToggle');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const submitBtn = document.getElementById('submitBtn');
    const toggleText = document.getElementById('toggleText');
    const nameGroup = document.getElementById('nameGroup');
    const errorMessage = document.getElementById('errorMessage');

    let isLogin = true;

    // 1. UI TOGGLE LOGIC
    authToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;

        // Reset error message
        errorMessage.style.display = 'none';

        if (isLogin) {
            authTitle.textContent = 'Airlock Login';
            authSubtitle.textContent = 'Establishing a secure connection to the universe.';
            submitBtn.textContent = 'Enter Frame';
            toggleText.innerHTML = 'No access code? <a href="#" id="authToggle">Request entry</a>';
            nameGroup.style.display = 'none';
            document.getElementById('fullName').required = false;
        } else {
            authTitle.textContent = 'Initiate Sequence';
            authSubtitle.textContent = 'Requesting credentials for the creative network.';
            submitBtn.textContent = 'Initiate Entry';
            toggleText.innerHTML = 'Already have access? <a href="#" id="authToggle">Reconnect</a>';
            nameGroup.style.display = 'block';
            document.getElementById('fullName').required = true;
        }

        // Re-attach listener to the new anchor
        document.getElementById('authToggle').addEventListener('click', arguments.callee);
    });

    // 2. FORM INTERCEPTION & BACKEND WIRING
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous errors
        errorMessage.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const fullName = document.getElementById('fullName').value;

        const endpoint = isLogin ? '/auth/login' : '/auth/signup';
        const payload = isLogin ? { email, password } : { email, password, full_name: fullName };

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Connection failed. Verify signals.');
            }

            // SUCCESS
            if (data.access_token) {
                // Store JWT token
                localStorage.setItem('frame_token', data.access_token);
                
                // Success feedback
                submitBtn.style.background = '#fff';
                submitBtn.textContent = 'Entry Granted';

                // Redirect into the platform
                setTimeout(() => {
                    window.location.href = 'explore.html';
                }, 800);
            } else if (!isLogin) {
                // If signup was successful but didn't auto-login
                alert("Account created. Please log in.");
                window.location.reload();
            }

        } catch (error) {
            console.error('[AUTH ERROR]', error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Enter Frame' : 'Initiate Entry';
        }
    });
});

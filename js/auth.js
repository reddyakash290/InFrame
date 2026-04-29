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
    function handleToggle(e) {
        if (e) e.preventDefault();
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

        // Re-attach listener because innerHTML destroyed the old element
        document.getElementById('authToggle').addEventListener('click', handleToggle);
    }

    authToggle.addEventListener('click', handleToggle);

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

        console.log(`[AUTH] Attempting ${isLogin ? 'Login' : 'Signup'} at ${endpoint}`);
        console.log(`[AUTH] Payload:`, payload);

        try {
            const response = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(`[AUTH] Response:`, data);

            if (!response.ok) {
                // Handle Pydantic validation errors or custom detail
                const msg = data.detail || (data.errors ? JSON.stringify(data.errors) : 'Connection failed.');
                throw new Error(msg);
            }

            // SUCCESS
            if (data.access_token) {
                localStorage.setItem('frame_token', data.access_token);
                submitBtn.style.background = '#fff';
                submitBtn.textContent = 'Entry Granted';

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 800);
            } else if (!isLogin) {
                alert("Account created successfully. You can now establish your signal.");
                handleToggle(); // Switch back to login mode
            }

        } catch (error) {
            console.error('[AUTH ERROR]', error);
            errorMessage.textContent = `Signal Error: ${error.message}`;
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Enter Frame' : 'Initiate Entry';
        }
    });
});

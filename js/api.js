/* 
  InFrame API Gateway 
  Handles all communication with the FastAPI backend.
*/

const BASE_URL = 'http://localhost:8000';

/**
 * Global API call utility
 * @param {string} endpoint - API endpoint (e.g., '/portfolio')
 * @param {string} method - HTTP method
 * @param {object} body - Request body
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('frame_token');

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Global 401 Interceptor: Session Expired
        if (response.status === 401) {
            console.warn("[API] Session expired (401). Redirecting to login...");
            localStorage.removeItem('frame_token');
            window.location.href = 'auth.html';
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API ERROR] ${method} ${endpoint}:`, error);
        throw error;
    }
}

// Export for module use or just keep global
// export { apiCall, BASE_URL };

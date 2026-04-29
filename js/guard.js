/* 
  InFrame Auth Guard
  Protects sensitive pages by redirecting unauthenticated users to the Airlock.
*/

(function() {
    const token = localStorage.getItem('frame_token');
    const isAuthPage = window.location.pathname.includes('auth.html');

    if (!token && !isAuthPage) {
        console.warn("[GUARD] No active session. Redirecting to Airlock...");
        window.location.href = 'auth.html';
    } else if (token && isAuthPage) {
        console.log("[GUARD] Active session found. Redirecting to Feed...");
        window.location.href = 'index.html';
    }
})();

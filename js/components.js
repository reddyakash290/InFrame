/* Frame Component Injector — Reusable Nav Utility */

document.addEventListener("DOMContentLoaded", () => {
    injectNavigation();
});

function injectNavigation() {
    const navPlaceholder = document.getElementById("nav-placeholder");
    if (!navPlaceholder) return;

    const navHTML = `
        <nav class="glass-nav">
            <div class="nav-container">
                <a href="index.html" class="logo">Frame<span></span></a>
                
                <div class="nav-search">
                    <span>🔍</span>
                    <input type="text" placeholder="Search creatives, projects…">
                </div>

                <div class="nav-links">
                    <a href="index.html" class="nav-item">Feed</a>
                    <a href="explore.html" class="nav-item">Explore</a>
                    <a href="network.html" class="nav-item">Network</a>
                </div>

                <div class="nav-actions">
                    <a href="messages.html" class="nav-icon" style="text-decoration: none;">💬</a>
                    <div class="nav-icon">🔔</div>
                    <button class="btn-primary">Post Work</button>
                    <div class="profile-wrapper">
                        <div class="avatar-sm" id="nav-profile-btn">A</div>
                        <div class="profile-dropdown" id="nav-profile-dropdown">
                            <button class="dropdown-item" id="nav-logout-btn">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    `;

    navPlaceholder.innerHTML = navHTML;

    // Highlight active link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const links = navPlaceholder.querySelectorAll(".nav-item");
    links.forEach(link => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
        }
    });

    // Profile Dropdown Logic
    const profileBtn = document.getElementById("nav-profile-btn");
    const profileDropdown = document.getElementById("nav-profile-dropdown");
    const logoutBtn = document.getElementById("nav-logout-btn");

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove("show");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("frame_token");
            // Assuming auth.html is the login/signup page
            window.location.href = "auth.html";
        });
    }
}

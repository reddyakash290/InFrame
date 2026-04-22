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
                    <div class="avatar-sm">A</div>
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
}

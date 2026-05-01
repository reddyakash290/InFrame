/* 
  InFrame Profile Synchronizer
  Fetches the logged-in user's profile and syncs it across the UI.
  Strict Mapping: Reflects true database state (handling NULLs honestly).
*/

document.addEventListener('DOMContentLoaded', () => {
    loadCurrentUserData();
});

async function loadCurrentUserData() {
    const token = localStorage.getItem('frame_token');
    if (!token) return;

    try {
        const user = await apiCall('/users/me');
        console.log("[USER-SYNC] Profile loaded:", user);

        if (user && user.stats) {
            console.log("Attempting to map stats to DOM...");

            const elConnections = document.getElementById('stat-connections');
            if (elConnections) {
                elConnections.innerText = user.stats.connections;
                console.log("✅ Mapped connections successfully!");
            } else {
                console.error("❌ Could NOT find HTML element with id 'stat-connections'");
            }

            const elProjects = document.getElementById('stat-projects');
            if (elProjects) {
                elProjects.innerText = user.stats.projects;
                console.log("✅ Mapped projects successfully!");
            } else {
                console.error("❌ Could NOT find HTML element with id 'stat-projects'");
            }

            const elViews = document.getElementById('stat-views');
            if (elViews) elViews.innerText = user.stats.views;

            const elCredits = document.getElementById('stat-credits');
            if (elCredits) elCredits.innerText = user.stats.festival_credits;

            const elResponseRate = document.getElementById('stat-response-rate');
            if (elResponseRate) elResponseRate.innerText = user.stats.response_rate;
        }

        if (user) {
            updateNavbar(user);
            updateSidebar(user);
            updateComposeBox(user);
            updateProfilePage(user);
        }
    } catch (error) {
        console.error("[USER-SYNC ERROR] Failed to fetch profile:", error);
    }
}

/**
 * Helper to apply consistent avatar styling
 */
function applyAvatarStyles(element, user) {
    if (!element) return;

    if (user.avatar_url) {
        element.style.backgroundImage = `url(${user.avatar_url})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundColor = 'transparent';
        element.innerText = ''; 
    } else {
        const initial = user.full_name ? user.full_name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U');
        element.style.backgroundImage = 'none';
        element.style.backgroundColor = 'var(--accent)'; 
        element.style.color = '#000'; 
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontWeight = 'bold';
        element.innerText = initial;
    }
}

/**
 * Updates the Global Navigation Bar
 */
function updateNavbar(user) {
    const navAvatar = document.getElementById('nav-profile-btn');
    applyAvatarStyles(navAvatar, user);
}

/**
 * Updates the Feed Sidebar (index.html)
 */
function updateSidebar(user) {
    const sidebarAvatar = document.querySelector('.sidebar .profile-avatar');
    const sidebarName = document.querySelector('.sidebar .profile-name');
    const sidebarRole = document.querySelector('.sidebar .profile-role');

    if (sidebarName) sidebarName.textContent = user.full_name || `User-${user.id.substring(0, 8)}`;
    if (sidebarRole) sidebarRole.textContent = user.role || 'Role not set';
    
    applyAvatarStyles(sidebarAvatar, user);
}

/**
 * Updates the Compose Box Avatar (index.html)
 */
function updateComposeBox(user) {
    const composeAvatar = document.querySelector('.compose-box .post-avatar');
    applyAvatarStyles(composeAvatar, user);
}

/**
 * Updates the My Profile Page (myprofile.html)
 */
function updateProfilePage(user) {
    // Only run if we are on myprofile.html
    const isProfilePage = window.location.pathname.includes('myprofile.html');
    if (!isProfilePage) return;

    const heroAvatar = document.querySelector('.avatar-inner');
    const heroName = document.getElementById('profile-hero-name');
    const heroRole = document.getElementById('profile-hero-role');
    const heroLocation = document.getElementById('profile-hero-location');
    const heroMeta = document.querySelector('.profile-meta');
    const aboutSections = document.querySelectorAll('.about-text');

    if (heroName) heroName.textContent = user.full_name || `User-${user.id.substring(0, 8)}`;
    if (heroRole) heroRole.textContent = user.role || 'Role not set';
    
    applyAvatarStyles(heroAvatar, user);

    if (heroLocation) {
        heroLocation.textContent = user.location ? `📍 ${user.location}` : "📍 Location not set";
    }

    if (heroMeta) {
        // Handle is_open_to_collab badge
        const collabBadge = Array.from(heroMeta.querySelectorAll('span')).find(s => s.textContent.includes('Open to work') || s.textContent.includes('Open to collab'));
        if (collabBadge) {
            if (user.is_open_to_collab) {
                collabBadge.style.display = 'inline';
                collabBadge.textContent = '● Open to work';
                collabBadge.style.color = 'var(--accent2)';
            } else {
                collabBadge.style.display = 'none';
            }
        }
    }

    if (aboutSections.length > 0) {
        aboutSections[0].textContent = user.bio || "No bio added yet.";
        if (aboutSections[1]) {
            aboutSections[1].style.display = user.bio ? 'block' : 'none';
        }
    }

    // Load Portfolio Items
    loadPortfolioData();
}

/**
 * Fetches and renders the user's portfolio items
 */
async function loadPortfolioData() {
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    try {
        const items = await apiCall('/users/me/portfolio');
        console.log("[USER-SYNC] Portfolio items loaded:", items);

        if (items && items.length > 0) {
            portfolioGrid.innerHTML = items.map((item, index) => `
                <div class="portfolio-item ${index === 0 ? 'featured' : ''}">
                    <div class="port-thumb" style="${item.media_url ? `background-image: url(${item.media_url}); background-size: cover; background-position: center;` : 'background: var(--bg3); display: flex; align-items: center; justify-content: center; font-size: 40px;'}">
                        ${item.media_url ? '' : '🎬'}
                        <div class="port-play">▶</div>
                        <div class="port-overlay">
                            <div class="port-type">${item.project_type}</div>
                            <div class="port-title">${item.title}</div>
                            <div class="port-year">${item.year}</div>
                        </div>
                    </div>
                    <div class="port-info">
                        <div class="port-info-title">${item.title}</div>
                        <div class="port-info-sub">${item.project_type} · ${item.year}</div>
                    </div>
                </div>
            `).join('');
        } else {
            portfolioGrid.innerHTML = '<div class="no-data" style="padding: 40px; text-align: center; color: var(--muted); border: 1px dashed var(--border2); border-radius: 12px; grid-column: 1 / -1;">No portfolio items added yet.</div>';
        }
    } catch (error) {
        console.error("[USER-SYNC ERROR] Failed to fetch portfolio:", error);
        portfolioGrid.innerHTML = '<div class="no-data" style="padding: 40px; text-align: center; color: var(--accent-red); grid-column: 1 / -1;">Error loading portfolio.</div>';
    }
}

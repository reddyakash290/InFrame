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
}

/* 
  Explore — Masonry Universe Dynamic Loader
  Wires the explore feed to the backend while maintaining cinematic interactions.
*/

document.addEventListener('DOMContentLoaded', () => {
    loadExploreFeed();
});

async function loadExploreFeed() {
    const universe = document.getElementById('masonryUniverse');
    if (!universe) return;

    try {
        // 1. Fetch feed from backend
        const feed = await apiCall('/posts/feed');
        
        // 2. Clear universe
        universe.innerHTML = '';

        // 3. Build dynamic nodes
        feed.forEach((post, index) => {
            const node = document.createElement('div');
            node.className = 'explore-node reveal-node';
            node.style.setProperty('--delay', `${(index * 0.1).toFixed(1)}s`);

            const mediaClass = post.media_class || `v${(index % 5) + 1}`;
            const aspectRatio = post.aspect_ratio || '16/9';
            
            // Availability Dot Logic
            const availHTML = post.is_open_to_collab ? `
                <div class="avail-indicator">
                    <div class="avail-dot"></div>
                    <span>Open to Collab</span>
                </div>
            ` : '';

            // Tags Injection
            const tagsHTML = (post.tags || []).map(tag => `<span>#${tag}</span>`).join('');

            node.innerHTML = `
                <div class="node-media ${mediaClass}" style="aspect-ratio: ${aspectRatio}">
                    ${post.media_url ? `<img src="${post.media_url}" style="width:100%;height:100%;object-fit:cover;">` : '🎬'}
                </div>
                <div class="node-overlay">
                    <a href="profile.html?id=${post.creator_id}" class="creator-mini-link" style="text-decoration: none;">
                        <div class="creator-mini">
                            <div class="mini-avatar" style="background: ${post.creator_color || 'var(--accent)'}">
                                ${post.creator_name ? post.creator_name[0] : '?'}
                            </div>
                            <div class="mini-info">
                                <span class="mini-name">${post.creator_name}</span>
                                <span class="mini-role" style="font-size: 10px; color: rgba(255,255,255,0.6);">${post.creator_role || ''}</span>
                                ${availHTML}
                            </div>
                        </div>
                    </a>
                </div>
                <div class="node-content">
                    <p class="node-text" style="font-size: 12px; line-height: 1.4; color: var(--text-muted); margin-bottom: 8px;">
                        ${post.content || ''}
                    </p>
                    <div class="node-tags">
                        ${tagsHTML}
                    </div>
                    <button class="btn-cast-glow" onclick="event.stopPropagation(); openCastingModal('${post.creator_name}')">Cast</button>
                </div>
            `;

            universe.appendChild(node);
        });

        // 4. Re-initialize Interactions
        initExploreInteractions();

    } catch (error) {
        console.error("Explore load failed:", error);
        universe.innerHTML = `<p style="grid-column: 1/-1; padding: 100px; text-align: center; color: var(--text-muted);">Failed to sync with the universe...</p>`;
    }
}

function initExploreInteractions() {
    // Re-run the scroll reveal observer for new elements
    const revealOptions = { threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const node = entry.target;
                const delay = node.style.getPropertyValue('--delay') || '0s';
                setTimeout(() => node.classList.add('revealed'), parseFloat(delay) * 1000);
                revealObserver.unobserve(node);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-node').forEach(node => revealObserver.observe(node));

    // Handle horizontal drag for filter track (if it exists)
    const filterTrack = document.getElementById('filterTrack');
    if (filterTrack) {
        setupDragScroll(filterTrack);
    }
}

function openCastingModal(creatorName) {
    const modal = document.getElementById('casting-modal');
    if (!modal) return;
    
    // Update modal title with creator name
    const title = modal.querySelector('.syne');
    if (title) title.textContent = `Cast ${creatorName}`;
    
    modal.classList.remove('hidden');
    document.getElementById('masonryUniverse').classList.add('universe-pushed');
    document.body.style.overflow = 'hidden';
}

function setupDragScroll(el) {
    let isDown = false;
    let startX;
    let scrollLeft;

    el.addEventListener('mousedown', (e) => {
        isDown = true;
        el.style.cursor = 'grabbing';
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
    });
    el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
    el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = 'grab'; });
    el.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2;
        el.scrollLeft = scrollLeft - walk;
    });
}

// Global Close for Modal
document.addEventListener('DOMContentLoaded', () => {
    const closeModalBtn = document.getElementById('closeModal');
    const castingModal = document.getElementById('casting-modal');
    
    if (closeModalBtn && castingModal) {
        closeModalBtn.addEventListener('click', () => {
            castingModal.classList.add('hidden');
            document.getElementById('masonryUniverse').classList.remove('universe-pushed');
            document.body.style.overflow = 'auto';
        });

        castingModal.addEventListener('click', (e) => {
            if (e.target === castingModal) {
                castingModal.classList.add('hidden');
                document.getElementById('masonryUniverse').classList.remove('universe-pushed');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

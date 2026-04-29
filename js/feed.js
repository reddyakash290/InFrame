/* 
  InFrame Feed Loader 
  Handles dynamic post rendering for the main landing page.
*/

document.addEventListener('DOMContentLoaded', () => {
    // 0. AUTH GUARD (Optional but recommended)
    if (!localStorage.getItem('frame_token')) {
        // window.location.href = 'auth.html'; // Uncomment to enforce login
    }

    loadMainFeed();
});

async function loadMainFeed() {
    const feedContainer = document.getElementById('feed-container');
    if (!feedContainer) {
        console.error("[FEED] Container not found.");
        return;
    }

    try {
        // 1. Fetch posts from backend
        const posts = await apiCall('/posts/feed');
        console.log("[FEED] Received posts:", posts);

        // 2. Clear existing (hardcoded) content if any
        // feedContainer.innerHTML = ''; // We'll do this in index.html cleanup

        // 3. Render posts
        posts.forEach((post, index) => {
            const postCard = createPostCard(post, index);
            feedContainer.appendChild(postCard);
        });

        // 4. Re-initialize interactions (likes, connects)
        initFeedInteractions();

    } catch (error) {
        console.error("[FEED ERROR] Failed to load feed:", error);
        feedContainer.innerHTML += `
            <div style="padding: 40px; text-align: center; color: var(--text-muted);">
                <p>Establishing signal lost...</p>
                <button onclick="loadMainFeed()" class="btn-primary" style="margin-top: 15px;">Retry Sync</button>
            </div>
        `;
    }
}

function createPostCard(post, index) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.style.animationDelay = `${(index * 0.1).toFixed(1)}s`;

    // Special handling for collab posts
    let collabHeader = '';
    if (post.media_type === 'collab' || post.is_open_to_collab) {
        collabHeader = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; padding: 6px 10px; background: rgba(196,107,58,0.08); border-radius: 8px; border: 1px solid rgba(196,107,58,0.2);">
                <span>🤝</span>
                <span style="font-size:12px; color: var(--accent2); font-weight:600; text-transform:uppercase; letter-spacing:1px;">Open Collaboration</span>
            </div>
        `;
    }

    // Media HTML generation
    let mediaHTML = '';
    if (post.media_type === 'video') {
        mediaHTML = `
            <div class="post-media">
                <div class="video-preview">
                    <div class="play-btn">▶</div>
                    <div class="video-duration">2:14</div>
                    <div class="video-title">Establishing Signal...</div>
                </div>
            </div>
        `;
    } else if (post.media_type === 'design' || post.media_type === 'photo') {
        mediaHTML = `
            <div class="post-media">
                <div class="media-grid-2">
                    <div class="media-item design" style="aspect-ratio:1">
                        <span>⬡</span>
                    </div>
                    <div class="media-item design" style="aspect-ratio:1">
                        <span>▦</span>
                    </div>
                </div>
            </div>
        `;
    }

    card.innerHTML = `
        ${collabHeader}
        <div class="post-header">
            <div class="post-avatar" style="background: ${post.creator_color || 'var(--accent)'}">${post.creator_name[0]}</div>
            <div class="post-meta">
                <div class="post-author">${post.creator_name}</div>
                <div class="post-role">${post.creator_role}</div>
                <div class="post-time">${post.time_ago} · ${post.location}</div>
            </div>
            <button class="connect-btn-sm">+ Connect</button>
            <button class="post-more">···</button>
        </div>
        <div class="post-text">
            ${post.content}
        </div>
        <div class="post-tags">
            ${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
        ${mediaHTML}
        <div class="post-actions">
            <button class="action-btn ${post.is_liked ? 'liked' : ''}">❤️ ${post.likes}</button>
            <button class="action-btn">💬 ${post.comments}</button>
            <button class="action-btn">🔁 Share</button>
            <button class="action-btn" style="margin-left:auto">🔖</button>
        </div>
    `;

    return card;
}

function initFeedInteractions() {
    // Re-bind like buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        if (btn.textContent.includes('❤️')) {
            btn.onclick = function() {
                this.classList.toggle('liked');
            };
        }
    });

    // Re-bind connect buttons
    document.querySelectorAll('.connect-btn-sm').forEach(btn => {
        btn.onclick = function() {
            if (this.textContent.trim() === '+ Connect') {
                this.textContent = '✓ Connected';
                this.style.background = 'rgba(232,201,126,0.1)';
                this.style.color = 'var(--accent)';
            }
        };
    });
}

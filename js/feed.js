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
    setupComposeBox();
});

function setupComposeBox() {
    const postBtn = document.querySelector('.post-btn');
    const composeInput = document.querySelector('.compose-input');

    if (!postBtn || !composeInput) return;

    postBtn.addEventListener('click', async () => {
        const content = composeInput.value.trim();

        if (!content) {
            alert("Please enter some content to post.");
            return;
        }

        postBtn.disabled = true;
        postBtn.textContent = "Posting...";

        try {
            // Send request to create post
            const newPost = await apiCall('/posts/', 'POST', {
                content: content,
                media_url: null,
                tags: []
            });

            console.log("[FEED] Post created successfully:", newPost);

            // Clear input and reset button
            composeInput.value = '';
            postBtn.textContent = "Post";
            postBtn.disabled = false;

            // Prepend the new post directly using the server response
            const feedContainer = document.getElementById('feed-container');
            if (feedContainer) {
                // Pass 0 as index so it appears immediately (no large delay)
                const newCard = createPostCard(newPost, 0);
                feedContainer.prepend(newCard);
                
                // Re-init interactions for the new card
                initFeedInteractions();
            }

        } catch (error) {
            console.error("[FEED ERROR] Failed to create post:", error);
            alert(`Failed to post: ${error.message}`);
            postBtn.textContent = "Post";
            postBtn.disabled = false;
        }
    });
}

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

        // 2. Clear existing (hardcoded) content
        feedContainer.innerHTML = '';

        // 3. Render posts
        posts.forEach((post, index) => {
            const postCard = createPostCard(post, index);
            feedContainer.appendChild(postCard);
        });

        // 4. Re-initialize interactions (likes, connects)
        initFeedInteractions();

    } catch (error) {
        console.error("[FEED ERROR] Failed to load feed:", error);
        feedContainer.innerHTML = `
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
    if (post.is_open_to_collab) {
        collabHeader = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; padding: 6px 10px; background: rgba(196,107,58,0.08); border-radius: 8px; border: 1px solid rgba(196,107,58,0.2);">
                <span>🤝</span>
                <span style="font-size:12px; color: var(--accent2); font-weight:600; text-transform:uppercase; letter-spacing:1px;">Open Collaboration</span>
            </div>
        `;
    }

    // Media HTML generation (Simplified for now)
    let mediaHTML = '';
    if (post.media_url) {
        mediaHTML = `
            <div class="post-media">
                <img src="${post.media_url}" alt="Post Media" style="width:100%; border-radius:12px;">
            </div>
        `;
    }

    // Author data handling
    const authorName = post.full_name || `User-${post.user_id.substring(0, 8)}`;
    const authorRole = post.role ? post.role : "Role not set";
    const timeDisplay = post.created_at ? new Date(post.created_at).toLocaleDateString() : "Just now";
    const likesCount = post.likes_count || 0;

    // Avatar Logic
    let avatarStyle = `background: var(--accent); color: #000;`;
    let avatarContent = authorName[0].toUpperCase();
    
    if (post.avatar_url) {
        avatarStyle = `background-image: url(${post.avatar_url}); background-size: cover; background-position: center; color: transparent;`;
        avatarContent = '';
    }

    card.innerHTML = `
        ${collabHeader || ''}
        <div class="post-header">
            <div class="post-avatar" style="${avatarStyle}">${avatarContent}</div>
            <div class="post-meta">
                <div class="post-author">${authorName}</div>
                <div class="post-role">${authorRole}</div>
                <div class="post-time">${timeDisplay} · Matrix</div>
            </div>
            <button class="connect-btn-sm">+ Connect</button>
            <button class="post-more">···</button>
        </div>
        <div class="post-text">
            ${post.content || ''}
        </div>
        <div class="post-tags">
            ${(post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('')}
        </div>
        ${mediaHTML || ''}
        <div class="post-actions">
            <button class="action-btn" onclick="toggleLike(${post.id}, this)">❤️ <span>${likesCount}</span></button>
            <button class="action-btn">💬 0</button>
            <button class="action-btn">🔁 Share</button>
            <button class="action-btn" style="margin-left:auto">🔖</button>
        </div>
    `;

    return card;
}

async function toggleLike(postId, btn) {
    try {
        const response = await apiCall(`/posts/${postId}/like`, 'POST');
        console.log("[FEED] Like toggled:", response);
        
        // Optimistic UI update or refresh
        const span = btn.querySelector('span');
        let count = parseInt(span.textContent);
        
        if (btn.classList.contains('liked')) {
            btn.classList.remove('liked');
            span.textContent = count - 1;
        } else {
            btn.classList.add('liked');
            span.textContent = count + 1;
        }
    } catch (error) {
        console.error("[FEED ERROR] Failed to toggle like:", error);
    }
}

function initFeedInteractions() {
    // Connect buttons behavior
    document.querySelectorAll('.connect-btn-sm').forEach(btn => {
        btn.onclick = function () {
            if (this.textContent.trim() === '+ Connect') {
                this.textContent = '✓ Connected';
                this.style.background = 'rgba(232,201,126,0.1)';
                this.style.color = 'var(--accent)';
            }
        };
    });
}

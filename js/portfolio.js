/* 
  Portfolio — Dynamic Loader & Physics Integration
  Fetches work from the backend and populates the Anti-Gravity field.
*/

document.addEventListener('DOMContentLoaded', () => {
    loadPortfolio();
});

async function loadPortfolio() {
    // Target the gravity-field container as requested
    // Fallback to portfolioMasonry if gravity-field doesn't exist
    const container = document.querySelector('.gravity-field') || document.getElementById('portfolioMasonry');
    if (!container) return;

    try {
        // 1. Fetch data from backend
        const projects = await apiCall('/portfolio');
        
        // 2. Clear existing static content
        container.innerHTML = '';

        // 3. Build dynamic nodes
        projects.forEach((project, index) => {
            const node = document.createElement('div');
            // Adding both .port-node (for styling) and .zero-g-item (for physics)
            node.className = `port-node zero-g-item reveal-node`;
            node.style.setProperty('--delay', `${index * 0.05}s`);

            // Map backend data to our Cinematic structure
            // aspect_ratio mapping (v1, v2, v3 etc are CSS gradients we built)
            const mediaClass = project.media_class || `v${(index % 5) + 1}`;
            const aspectRatio = project.aspect_ratio || '16/9';
            
            node.innerHTML = `
                <div class="port-media ${mediaClass}" style="aspect-ratio: ${aspectRatio}">
                    ${project.media_url ? `<img src="${project.media_url}" alt="${project.title}" style="width:100%; height:100%; object-fit:cover;">` : '🎬'}
                    <div class="port-over">
                        <div class="port-badge">${project.project_type || 'Project'}</div>
                        <div class="port-node-title">${project.title}</div>
                        <div class="port-node-meta">${project.meta_description || ''}</div>
                    </div>
                </div>
                <div class="port-node-footer">
                    <div>
                        <div class="port-node-name">${project.title}</div>
                        <div class="port-node-sub">${project.project_type} · ${project.year}</div>
                    </div>
                    ${project.tag ? `<span class="port-node-tag ${project.tag_class || ''}">${project.tag}</span>` : ''}
                </div>
            `;

            container.appendChild(node);
        });

        // 4. Re-attach Scroll Reveal
        initScrollReveal();

        // 5. Re-attach Physics Engine
        initPhysicsInteractivity();

    } catch (error) {
        container.innerHTML = `<p style="padding: 40px; color: var(--text-muted);">Failed to load portfolio. Establishing signal error...</p>`;
    }
}

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const node = entry.target;
                const delay = parseFloat(node.style.getPropertyValue('--delay') || '0') * 1000;
                setTimeout(() => node.classList.add('revealed'), delay);
                observer.unobserve(node);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-node').forEach(n => observer.observe(n));
}

function initPhysicsInteractivity() {
    // If physics.js is already loaded, we might need to trigger its re-scan
    // or just re-run the logic for the new .zero-g-item elements
    if (typeof window.initFramePhysics === 'function') {
        window.initFramePhysics();
    } else {
        console.warn("Physics engine not found. Ensure physics.js is loaded.");
    }
}

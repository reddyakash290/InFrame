/* Explore — Masonry Universe Interactions */

document.addEventListener('DOMContentLoaded', () => {
    const masonryUniverse = document.getElementById('masonryUniverse');
    const castingModal = document.getElementById('casting-modal');
    const castButtons = document.querySelectorAll('.btn-cast-glow');
    const closeModalBtn = document.getElementById('closeModal');
    const filterTrack = document.getElementById('filterTrack');

    // 1. SCROLL REVEAL (IntersectionObserver)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add revealed class with staggered delay
                const node = entry.target;
                const delay = node.style.getPropertyValue('--delay') || '0s';
                
                setTimeout(() => {
                    node.classList.add('revealed');
                }, parseFloat(delay) * 1000);
                
                revealObserver.unobserve(node);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal-node').forEach(node => {
        revealObserver.observe(node);
    });


    // 2. MODAL LOGIC (Hologram Overlay)
    function openModal() {
        castingModal.classList.remove('hidden');
        masonryUniverse.classList.add('universe-pushed');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeModal() {
        castingModal.classList.add('hidden');
        masonryUniverse.classList.remove('universe-pushed');
        document.body.style.overflow = 'auto';
    }

    castButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal();
        });
    });

    closeModalBtn.addEventListener('click', closeModal);

    // Close on outside click
    castingModal.addEventListener('click', (e) => {
        if (e.target === castingModal) {
            closeModal();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !castingModal.classList.contains('hidden')) {
            closeModal();
        }
    });


    // 3. HORIZONTAL DRAG (Filter Track)
    let isDown = false;
    let startX;
    let scrollLeft;

    if (filterTrack) {
        filterTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            filterTrack.style.cursor = 'grabbing';
            startX = e.pageX - filterTrack.offsetLeft;
            scrollLeft = filterTrack.scrollLeft;
        });

        filterTrack.addEventListener('mouseleave', () => {
            isDown = false;
            filterTrack.style.cursor = 'grab';
        });

        filterTrack.addEventListener('mouseup', () => {
            isDown = false;
            filterTrack.style.cursor = 'grab';
        });

        filterTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - filterTrack.offsetLeft;
            const walk = (x - startX) * 2; // speed multiplier
            filterTrack.scrollLeft = scrollLeft - walk;
        });
    }
});

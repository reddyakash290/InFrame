/* Explore Page Interactions */

document.addEventListener('DOMContentLoaded', () => {
    const castingModal = document.getElementById('casting-modal');
    const exploreUniverse = document.getElementById('exploreUniverse');
    const castButtons = document.querySelectorAll('.btn-cast');
    const closeModalBtn = document.getElementById('closeModal');
    const filterTrack = document.getElementById('filterTrack');

    // MODAL LOGIC
    function openModal() {
        castingModal.classList.remove('hidden');
        exploreUniverse.classList.add('universe-pushed');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeModal() {
        castingModal.classList.add('hidden');
        exploreUniverse.classList.remove('universe-pushed');
        document.body.style.overflow = 'auto';
    }

    castButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
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


    // FILTER TRACK DRAG SCROLLING
    let isDown = false;
    let startX;
    let scrollLeft;

    filterTrack.addEventListener('mousedown', (e) => {
        isDown = true;
        filterTrack.classList.add('active');
        startX = e.pageX - filterTrack.offsetLeft;
        scrollLeft = filterTrack.scrollLeft;
        filterTrack.style.cursor = 'grabbing';
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
        const walk = (x - startX) * 2; // Scroll speed multiplier
        filterTrack.scrollLeft = scrollLeft - walk;
    });

    // Touch support for drag
    filterTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - filterTrack.offsetLeft;
        scrollLeft = filterTrack.scrollLeft;
    });

    filterTrack.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - filterTrack.offsetLeft;
        const walk = (x - startX) * 2;
        filterTrack.scrollLeft = scrollLeft - walk;
    });
});

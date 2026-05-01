/* HUD Interaction Logic — Drag-to-scroll for Filter Track */

document.addEventListener('DOMContentLoaded', () => {
    const filterTrack = document.getElementById('filterTrack');
    if (!filterTrack) return;

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

/* Global Page Transitions */

document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        // Intercept internal links only
        const isInternal = link.getAttribute('href') && 
                          link.getAttribute('href').endsWith('.html') && 
                          !link.getAttribute('href').startsWith('http') &&
                          link.getAttribute('target') !== '_blank';

        if (isInternal) {
            link.addEventListener('click', (e) => {
                const targetUrl = link.href;
                
                // If it's just a hash or current page, ignore
                if (targetUrl === window.location.href) return;

                e.preventDefault();

                // Apply exit animation
                document.body.classList.add('page-exit');

                // Wait for animation (500ms) before navigating
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 500);
            });
        }
    });
});

// Handle browser back/forward buttons (optional but recommended)
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        document.body.classList.remove('page-exit');
    }
});

/* 
  Frame Physics Engine (V2 - Anti-Gravity Interactivity)
  This script uses LERP (Linear Interpolation) for smooth, 
  heavy-feeling 3D rotations on elements with the .zero-g-item class.
*/

document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".zero-g-item");
    if (items.length === 0) return;

    // Movement state
    let mouse = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const lerpFactor = 0.05; // Adjust for "heaviness" (lower = heavier)

    window.addEventListener("mousemove", (e) => {
        // Calculate mouse position relative to center of screen (-1 to 1)
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function animate() {
        // Interpolate target values for smoothness
        target.x += (mouse.x - target.x) * lerpFactor;
        target.y += (mouse.y - target.y) * lerpFactor;

        items.forEach(item => {
            // Only apply if the item is in viewport (optional optimization)
            const tiltX = target.y * 10; // Max 10 deg rotation
            const tiltY = -target.x * 10;
            
            // Apply 3D transforms
            // Note: CSS already handles base transform transitions, 
            // but JS gives us fine-grained momentum control.
            item.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${-Math.abs(target.x * 10)}px)`;
        });

        requestAnimationFrame(animate);
    }

    // Uncomment the line below to enable V2 Anti-Gravity interactivity
    // animate(); 
    
    console.log("Frame Physics: V2 Anti-Gravity Engine Loaded (Paused for V1)");
});

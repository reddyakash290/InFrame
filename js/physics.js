/* 
  Frame Physics Engine (V2 - Anti-Gravity Interactivity)
  This script uses LERP (Linear Interpolation) for smooth, 
  heavy-feeling 3D rotations on elements with the .zero-g-item class.
*/

(function() {
    let items = [];
    let mouse = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const lerpFactor = 0.05;
    let isRunning = false;

    window.initFramePhysics = function() {
        items = document.querySelectorAll(".zero-g-item");
        if (items.length > 0 && !isRunning) {
            isRunning = true;
            animate();
        }
    };

    window.addEventListener("mousemove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    });

    function animate() {
        target.x += (mouse.x - target.x) * lerpFactor;
        target.y += (mouse.y - target.y) * lerpFactor;

        items.forEach(item => {
            const tiltX = target.y * 10;
            const tiltY = -target.x * 10;
            item.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${-Math.abs(target.x * 10)}px)`;
        });

        requestAnimationFrame(animate);
    }

    document.addEventListener("DOMContentLoaded", () => {
        window.initFramePhysics();
        console.log("Frame Physics: V2 Anti-Gravity Engine Initialized");
    });
})();

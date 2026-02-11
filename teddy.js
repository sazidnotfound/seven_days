document.addEventListener('DOMContentLoaded', () => {
    const teddyWave = document.querySelector('.teddy-wave');
    const teddyEyes = document.querySelectorAll('.teddy-eye');
    const teddyEyeShines = document.querySelectorAll('.teddy-eye-shine');

    // --- Waving Animation ---
    let time = 0;
    function animateWave() {
        // Smooth sine wave for waving arm
        // Rotate between 10deg and 40deg
        const rotation = 25 + Math.sin(time) * 15;
        if (teddyWave) {
            teddyWave.style.transformOrigin = '45px 150px'; // Ensure pivot at shoulder
            teddyWave.style.transform = `rotate(${rotation}deg)`;
        }
        time += 0.05;
        requestAnimationFrame(animateWave);
    }
    animateWave();

    // --- Eye Tracking ---
    document.addEventListener('mousemove', (e) => {
        teddyEyes.forEach((eye, index) => {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            // Calculate angle to mouse
            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);

            // Limit movement radius (keep pupil inside eye)
            const maxRadius = 3;
            const distance = Math.min(maxRadius, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 20);

            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;

            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;

            // Move shine slightly less for depth
            if (teddyEyeShines[index]) {
                teddyEyeShines[index].style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
            }
        });
    });

    // --- Blinking ---
    function blink() {
        teddyEyes.forEach(eye => {
            eye.style.transition = 'transform 0.1s ease';
            eye.style.transform = 'scaleY(0.1)';
        });

        setTimeout(() => {
            teddyEyes.forEach(eye => {
                eye.style.transform = 'scaleY(1)';
            });
            // Remove transition after blink so eye tracking is smooth again
            setTimeout(() => {
                teddyEyes.forEach(eye => eye.style.transition = 'none');
            }, 100);
        }, 150);

        // Random blink interval between 2s and 6s
        setTimeout(blink, Math.random() * 4000 + 2000);
    }
    setTimeout(blink, 2000);
});

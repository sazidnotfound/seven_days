document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999'; // Ensure it's on top
    document.body.appendChild(canvas);

    let width, height;
    let particles = [];
    const colors = ['#ff758c', '#ff7eb3', '#facad1', '#ffc1e3', '#f48fb1'];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4; // Varied sizes
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = 1.0;
            this.decay = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.size *= 0.96; // Shrink over time
            this.life -= this.decay;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.life;
            ctx.beginPath();
            // Draw a heart shape
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(this.x, this.y + topCurveHeight);
            ctx.bezierCurveTo(
                this.x, this.y,
                this.x - this.size / 2, this.y,
                this.x - this.size / 2, this.y + topCurveHeight
            );
            ctx.bezierCurveTo(
                this.x - this.size / 2, this.y + (this.size + topCurveHeight) / 2,
                this.x, this.y + (this.size + topCurveHeight) / 2,
                this.x, this.y + this.size
            );
            ctx.bezierCurveTo(
                this.x, this.y + (this.size + topCurveHeight) / 2,
                this.x + this.size / 2, this.y + (this.size + topCurveHeight) / 2,
                this.x + this.size / 2, this.y + topCurveHeight
            );
            ctx.bezierCurveTo(
                this.x + this.size / 2, this.y,
                this.x, this.y,
                this.x, this.y + topCurveHeight
            );
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    function addParticle(x, y) {
        particles.push(new Particle(x, y));
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach((particle, index) => {
            particle.update();
            particle.draw();
            if (particle.life <= 0 || particle.size <= 0.5) {
                particles.splice(index, 1);
            }
        });
        requestAnimationFrame(animate);
    }

    animate();

    // Mouse move event
    document.addEventListener('mousemove', (e) => {
        // Add multiple particles for a richer trail
        for (let i = 0; i < 2; i++) {
            addParticle(e.clientX, e.clientY);
        }
    });

    // Touch move event for mobile
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        for (let i = 0; i < 2; i++) {
            addParticle(touch.clientX, touch.clientY);
        }
    });
});

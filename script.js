// ===================================
// BlessSoul Premium Website v2.0
// JavaScript - Star Field, Navigation & Animations
// ===================================

// ===================================
// STAR FIELD CANVAS ANIMATION
// ===================================
function initStarField() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Star {
        constructor(type = 'normal') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.type = type;

            if (type === 'bright') {
                this.coreSize = 1.1 + Math.random() * 0.5;
                this.glowSize = 4 + Math.random() * 4;
                this.maxBrightness = 0.9 + Math.random() * 0.1;
                this.color = [255, 220, 180];
            } else if (type === 'medium') {
                this.coreSize = 0.7 + Math.random() * 0.4;
                this.glowSize = 2.5 + Math.random() * 2.5;
                this.maxBrightness = 0.7 + Math.random() * 0.2;
                this.color = [255, 240, 220];
            } else {
                this.coreSize = 0.4 + Math.random() * 0.3;
                this.glowSize = 0;
                this.maxBrightness = 0.4 + Math.random() * 0.3;
                this.color = [255, 255, 255];
            }

            // Twinkle cycle: brighten → dim → PAUSE → brighten
            this.cycleDuration = 2 + Math.random() * 3;       // 2-5s full cycle
            this.pauseDuration = 0.3 + Math.random() * 0.7;   // 0.3-1s pause at dim
            this.totalDuration = this.cycleDuration + this.pauseDuration;
            this.phase = Math.random() * this.totalDuration;   // random start offset
        }

        draw(time) {
            // Where are we in this star's cycle?
            const t = (time + this.phase) % this.totalDuration;
            let brightness;

            if (t < this.cycleDuration) {
                // Active twinkle phase: sine wave from bright → dim → bright
                const progress = t / this.cycleDuration;
                brightness = 0.15 + 0.85 * Math.abs(Math.sin(progress * Math.PI));
            } else {
                // Pause phase: stay dim
                brightness = 0.15;
            }

            const opacity = this.maxBrightness * brightness;
            const [r, g, b] = this.color;

            // Draw soft glow halo (bright & medium only)
            if (this.glowSize > 0) {
                const glowRadius = this.glowSize * brightness;
                const grad = ctx.createRadialGradient(
                    this.x, this.y, 0,
                    this.x, this.y, glowRadius
                );
                grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`);
                grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw sharp core point
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.coreSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const brightStars = [];
    const mediumStars = [];
    const dimStars = [];

    for (let i = 0; i < 100; i++) brightStars.push(new Star('bright'));
    for (let i = 0; i < 200; i++) mediumStars.push(new Star('medium'));
    for (let i = 0; i < 300; i++) dimStars.push(new Star('dim'));

    let startTime = Date.now();
    let isAnimating = true;

    function animate() {
        if (!isAnimating) return;
        const currentTime = (Date.now() - startTime) / 1000;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        dimStars.forEach(star => star.draw(currentTime));
        mediumStars.forEach(star => star.draw(currentTime));
        brightStars.forEach(star => star.draw(currentTime));

        requestAnimationFrame(animate);
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isAnimating = false;
        } else {
            isAnimating = true;
            startTime = Date.now();
            animate();
        }
    });

    animate();
}

// ===================================
// HAMBURGER MENU
// ===================================
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ===================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ===================================
// TESTIMONIALS INFINITE CAROUSEL
// ===================================
function initTestimonialsCarousel() {
    const track = document.querySelector('.testimonials-track');
    if (!track) return;

    // Clone all cards and append for seamless infinite loop
    const cards = track.querySelectorAll('.testimonial-card');
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
}

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initStarField();
    initHamburgerMenu();
    initHeaderScroll();
    initSmoothScroll();
    initScrollAnimations();
    initTestimonialsCarousel();

    // Fade in hero text
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        setTimeout(() => {
            heroText.classList.add('fade-in-up');
        }, 100);
    }
});

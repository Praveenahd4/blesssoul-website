// ===================================
// BlessSoul Premium Website
// JavaScript - Star Field & Interactions
// ===================================

// ===================================
// STAR FIELD CANVAS ANIMATION
// ===================================
function initStarField() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Star class
    class Star {
        constructor(type = 'normal') {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.type = type;

            if (type === 'bright') {
                // Bright twinkling stars
                this.baseSize = 1.5 + Math.random() * 2.5;
                this.brightness = 0.8 + Math.random() * 0.2;
                this.speed = 0.5 + Math.random() * 1.5;
            } else if (type === 'medium') {
                // Medium stars with subtle twinkle
                this.baseSize = 1.0 + Math.random() * 1.5;
                this.brightness = 0.5 + Math.random() * 0.3;
                this.speed = 0.2 + Math.random() * 0.8;
            } else {
                // Dim background stars
                this.baseSize = 0.8 + Math.random() * 1.2;
                this.brightness = 0.3 + Math.random() * 0.4;
                this.speed = 0.1 + Math.random() * 0.5;
            }

            // Each star gets unique twinkle characteristics
            this.phase = Math.random() * Math.PI * 2;
            this.glowIntensity = Math.random();
        }

        draw(time) {
            // Twinkle calculation - more visible range
            const twinkle = 0.5 + 0.5 * Math.sin(time * this.speed + this.phase);
            const size = this.baseSize;
            const opacity = this.brightness * twinkle;

            // Add glow effect based on star type
            if (this.type === 'bright') {
                ctx.shadowBlur = 8 + (twinkle * 12);
                ctx.shadowColor = `rgba(255, 159, 90, ${opacity})`;
            } else if (this.type === 'medium') {
                ctx.shadowBlur = 4 + (twinkle * 6);
                ctx.shadowColor = `rgba(255, 200, 150, ${opacity * 0.7})`;
            } else {
                ctx.shadowBlur = 2 + (twinkle * 4);
                ctx.shadowColor = `rgba(255, 255, 255, ${opacity * 0.5})`;
            }

            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Reset shadow for next star
            ctx.shadowBlur = 0;
        }
    }
    
    // Create stars for galaxy effect
    const brightStars = [];
    const mediumStars = [];
    const dimStars = [];

    // 100 bright twinkling stars (very visible)
    for (let i = 0; i < 100; i++) {
        brightStars.push(new Star('bright'));
    }

    // 200 medium stars (visible galaxy layer)
    for (let i = 0; i < 200; i++) {
        mediumStars.push(new Star('medium'));
    }

    // 300 dim background stars (dense galaxy background)
    for (let i = 0; i < 300; i++) {
        dimStars.push(new Star('dim'));
    }
    
    // Animation loop
    let startTime = Date.now();
    
    function animate() {
        const currentTime = (Date.now() - startTime) / 1000;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars in layers (back to front)
        dimStars.forEach(star => star.draw(currentTime));
        mediumStars.forEach(star => star.draw(currentTime));
        brightStars.forEach(star => star.draw(currentTime));
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ===================================
// SMOOTH SCROLL
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// SCROLL ANIMATIONS
// ===================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
}

// ===================================
// APP STORE LINK (Ready for activation)
// ===================================
// When Apple approves, uncomment this and add your App Store URL:
/*
const APP_STORE_URL = 'https://apps.apple.com/app/blesssoul/YOUR_APP_ID';

document.getElementById('downloadButton')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(APP_STORE_URL, '_blank');
});

// Update status badge
const statusBadge = document.querySelector('.status-text');
if (statusBadge) {
    statusBadge.textContent = 'Now Available on App Store';
}

// Update coming soon text
const comingSoon = document.querySelector('.coming-soon-text');
if (comingSoon) {
    comingSoon.style.display = 'none';
}

// Enable app store badge
const appStoreBadge = document.querySelector('.app-store-badge');
if (appStoreBadge) {
    appStoreBadge.style.opacity = '1';
    appStoreBadge.parentElement.href = APP_STORE_URL;
}
*/

// ===================================
// WAITLIST FORM (If you want to keep it)
// ===================================
const waitlistForm = document.getElementById('waitlistForm');
if (waitlistForm) {
    waitlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const submitButton = waitlistForm.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        // Show loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        
        try {
            // Replace with your Supabase function or API endpoint
            const response = await fetch('YOUR_API_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            
            if (response.ok) {
                waitlistForm.style.display = 'none';
                successMessage.style.display = 'block';
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            errorMessage.style.display = 'block';
            console.error('Waitlist submission error:', error);
        } finally {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        }
    });
}

// ===================================
// INITIALIZE ON PAGE LOAD
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initStarField();
    initScrollAnimations();
    
    // Add fade-in animation to hero
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        setTimeout(() => {
            heroText.classList.add('fade-in-up');
        }, 100);
    }
});

// ===================================
// PERFORMANCE OPTIMIZATION
// ===================================
// Pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    const canvas = document.getElementById('starfield');
    if (document.hidden && canvas) {
        canvas.style.opacity = '0.5';
    } else if (canvas) {
        canvas.style.opacity = '1';
    }
});

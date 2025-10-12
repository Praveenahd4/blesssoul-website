// ===================================
// Supabase Configuration
// ===================================
// Using the same Supabase project as the iOS app
const SUPABASE_URL = 'https://xykiguryflrumebgwzef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5a2lndXJ5ZmxydW1lYmd3emVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNzAyMjEsImV4cCI6MjA3MTY0NjIyMX0.i3j_5_ngl1RkRsIF5200FBpoVnkag6DH3dSCpmCdSFQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================================
// Smooth Scrolling
// ===================================
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

// ===================================
// Header Scroll Effect
// ===================================
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===================================
// Waitlist Form Handling
// ===================================
const waitlistForm = document.getElementById('waitlistForm');
const emailInput = document.getElementById('email');
const submitButton = waitlistForm.querySelector('.submit-button');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Basic validation
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address.');
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        // Save email to Supabase
        await saveEmailToSupabase(email);

        // Show success message for new signup
        showSuccess(false);

        // Reset form
        emailInput.value = '';

    } catch (error) {
        console.error('Submission error:', error);

        // Handle specific error messages
        if (error.message.includes('duplicate') || error.code === '23505') {
            // Show success message for duplicate (they're already registered!)
            showSuccess(true);
            emailInput.value = '';
        } else if (error.message.includes('not configured')) {
            showError('Supabase is not configured yet. Please contact support@blesssoul.com');
        } else {
            showError('Something went wrong. Please try again or contact us at support@blesssoul.com');
        }
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
});

// ===================================
// Helper Functions
// ===================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccess(isDuplicate = false) {
    // Update success message based on whether it's a new signup or duplicate
    const successTitle = document.querySelector('#successMessage h3');
    const successText = document.querySelector('#successMessage p');

    if (isDuplicate) {
        successTitle.textContent = "You're Already on the List!";
        successText.textContent = "Good news—you're already registered! Stay tuned, we'll notify you the moment BlessSoul launches on the App Store.";
    } else {
        successTitle.textContent = "You're on the List!";
        successText.textContent = "We'll notify you the moment BlessSoul launches on the App Store. Get ready to manifest your best life!";
    }

    waitlistForm.style.display = 'none';
    errorMessage.classList.remove('show');
    successMessage.classList.add('show');
}

function showError(message) {
    errorText.innerHTML = message;
    errorMessage.classList.add('show');
    successMessage.classList.remove('show');

    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// ===================================
// Supabase Integration
// ===================================
async function saveEmailToSupabase(email) {
    // Check if Supabase is configured
    if (!supabase) {
        throw new Error('Supabase is not configured. Please add your credentials to script.js');
    }

    // Get user agent and basic metadata
    const userAgent = navigator.userAgent;
    const metadata = {
        referrer: document.referrer || 'direct',
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
    };

    // Insert email into waitlist table
    const { data, error } = await supabase
        .from('waitlist')
        .insert([
            {
                email: email,
                source: 'website',
                user_agent: userAgent,
                metadata: metadata
            }
        ])
        .select();

    if (error) {
        console.error('Supabase error:', error);
        throw error;
    }

    console.log('✅ Email successfully added to waitlist:', data);
    return data;
}

// ===================================
// Intersection Observer for Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});

// ===================================
// Console Easter Egg
// ===================================
console.log('%c✨ Welcome to BlessSoul ✨', 'color: #FF7A3D; font-size: 20px; font-weight: bold;');
console.log('%cManifest your best life, one day at a time.', 'color: #FFB84D; font-size: 14px;');
console.log('%c\nInterested in joining our team? Email us at support@blesssoul.com', 'color: #737373; font-size: 12px;');

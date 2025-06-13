// This script runs after the DOM is loaded.
// The theme logic is handled by a script in the <head> to prevent FOUC.
document.addEventListener('DOMContentLoaded', () => {

    const randomThemeBtn = document.getElementById('random-theme-btn');

    // --- DUAL GLITCHING TITLE EFFECT ---
    const glitchElement1 = document.getElementById('glitch-o-1');
    const glitchElement2 = document.getElementById('glitch-o-2');
    
    if (glitchElement1) {
        setInterval(() => {
            glitchElement1.textContent = Math.random() > 0.5 ? 'o' : '0';
        }, 300);
    }
    if (glitchElement2) {
        setInterval(() => {
            glitchElement2.textContent = Math.random() > 0.5 ? 'o' : '0';
        }, 450);
    }

    // --- THEME RANDOMIZER ---
    function applyAndSaveTheme(theme) {
        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.bg);
        root.style.setProperty('--fg-color', theme.fg);
        root.style.setProperty('--accent-color', theme.accent);
        
        localStorage.setItem('yptoxUserTheme', JSON.stringify(theme));
    }

    if (randomThemeBtn) {
        randomThemeBtn.addEventListener('click', () => {
            const palettes = window.yptoxPalettes;
            if (palettes && palettes.length > 0) {
                const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
                applyAndSaveTheme(randomPalette);
            }
        });
    }

    // --- FOOTER YEAR ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- WIP CAROUSEL LOGIC ---
    const wipCarousel = document.getElementById('wip-carousel');
    if (wipCarousel) {
        const track = wipCarousel.querySelector('.wip-carousel-track');
        const items = Array.from(track.children);
        const nextButton = document.getElementById('carousel-next'); 
        const prevButton = document.getElementById('carousel-prev');
        
        if (track && items.length > 0 && nextButton && prevButton) {
            let currentIndex = 0;
            const totalItems = items.length;
            const moveToSlide = (index) => {
                const itemWidth = items[0].getBoundingClientRect().width;
                track.style.transform = 'translateX(-' + itemWidth * index + 'px)';
                currentIndex = index;
            };
            nextButton.addEventListener('click', () => { moveToSlide((currentIndex + 1) % totalItems); });
            prevButton.addEventListener('click', () => { moveToSlide((currentIndex - 1 + totalItems) % totalItems); });
            window.addEventListener('resize', () => moveToSlide(currentIndex));
        }
    }

    // --- SYNCED-TEXT CAROUSEL LOGIC ---
    function initializeSyncedCarousel(carouselId) {
        const carouselElement = document.getElementById(carouselId);
        if (!carouselElement) return;
        const track = carouselElement.querySelector('.showcase-carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carouselElement.querySelector('.carousel-btn.next');
        const prevButton = carouselElement.querySelector('.carousel-btn.prev');
        const textBlurbsContainer = document.getElementById(carouselElement.dataset.blurbsId);
        const blurbs = Array.from(textBlurbsContainer.children);
        if (!track || slides.length === 0 || !nextButton || !prevButton || !textBlurbsContainer || blurbs.length === 0) return;
        let currentIndex = 0;
        const totalSlides = slides.length;
        const updateContent = (index) => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = 'translateX(-' + slideWidth * index + 'px)';
            blurbs.forEach((blurb, blurbIndex) => {
                blurb.style.display = (blurbIndex === index) ? 'block' : 'none';
            });
            currentIndex = index;
        };
        nextButton.addEventListener('click', () => { updateContent((currentIndex + 1) % totalSlides); });
        prevButton.addEventListener('click', () => { updateContent((currentIndex - 1 + totalSlides) % totalSlides); });
        updateContent(0);
        window.addEventListener('resize', () => updateContent(currentIndex));
    }
    initializeSyncedCarousel('concept-carousel');
    initializeSyncedCarousel('development-carousel');

    // --- [CORRECTED] COLLAPSIBLE SECTION LOGIC ---
    const triggers = document.querySelectorAll('.collapsible-trigger');
    triggers.forEach(trigger => {
        // Set initial state to open
        const content = trigger.nextElementSibling;
        if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
        }

        trigger.addEventListener('click', function() {
            this.classList.toggle('is-collapsed');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                // If it's open, close it
                content.style.maxHeight = null;
            } else {
                // If it's closed, open it
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
});
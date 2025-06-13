// --- START OF FILE script.js ---

// --- OPTIMIZATION: Debounce utility function ---
// This prevents a function from being called too frequently, such as on window resize.
function debounce(func, wait = 20) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}


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


    // --- ADDED: CREATION PAGE TIMELINE TOGGLE LOGIC (for touch devices) ---
    if (document.body.classList.contains('page-creation')) {
        const timelineItems = document.querySelectorAll('.timeline-container .timeline-item');

        timelineItems.forEach(item => {
            const title = item.querySelector('.timeline-title');
            if (title) {
                // Set initial state for accessibility
                const preview = item.querySelector('.timeline-preview');
                title.setAttribute('aria-expanded', 'false');
                preview.setAttribute('aria-hidden', 'true');
                
                title.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isExpanded = title.getAttribute('aria-expanded') === 'true';

                    // Close all other items first for an accordion effect
                    timelineItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherTitle = otherItem.querySelector('.timeline-title');
                            const otherPreview = otherItem.querySelector('.timeline-preview');
                            otherPreview.style.maxHeight = null;
                            otherPreview.style.opacity = '0';
                            otherPreview.style.visibility = 'hidden';
                            otherTitle.setAttribute('aria-expanded', 'false');
                            otherPreview.setAttribute('aria-hidden', 'true');
                        }
                    });

                    // Toggle the clicked item
                    if (isExpanded) {
                        preview.style.maxHeight = null;
                        preview.style.opacity = '0';
                        preview.style.visibility = 'hidden';
                        title.setAttribute('aria-expanded', 'false');
                        preview.setAttribute('aria-hidden', 'true');
                    } else {
                        preview.style.visibility = 'visible';
                        preview.style.opacity = '1';
                        preview.style.maxHeight = preview.scrollHeight + 'px';
                        title.setAttribute('aria-expanded', 'true');
                        preview.setAttribute('aria-hidden', 'false');
                    }
                });
            }
        });
    }
    // --- END OF ADDED LOGIC ---


    // --- REFACTOR: UNIFIED CAROUSEL & RESIZE LOGIC ---
    const carouselsToUpdateOnResize = [];

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
                if (!items[0]) return;
                const itemWidth = items[0].getBoundingClientRect().width;
                track.style.transform = `translateX(-${itemWidth * index}px)`;
                currentIndex = index;
            };

            nextButton.addEventListener('click', () => { moveToSlide((currentIndex + 1) % totalItems); });
            prevButton.addEventListener('click', () => { moveToSlide((currentIndex - 1 + totalItems) % totalItems); });
            
            // Add this carousel's update function to our list for resize handling
            carouselsToUpdateOnResize.push(() => moveToSlide(currentIndex));
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
        
        if (!track || slides.length === 0 || !nextButton || !prevButton || !textBlurbsContainer) return;
        
        const blurbs = Array.from(textBlurbsContainer.children);
        if (blurbs.length === 0) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        const updateContent = (index) => {
            if (!slides[0]) return;
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${slideWidth * index}px)`;
            blurbs.forEach((blurb, blurbIndex) => {
                blurb.style.display = (blurbIndex === index) ? 'block' : 'none';
            });
            currentIndex = index;
        };

        nextButton.addEventListener('click', () => { updateContent((currentIndex + 1) % totalSlides); });
        prevButton.addEventListener('click', () => { updateContent((currentIndex - 1 + totalSlides) % totalSlides); });
        
        // Add this carousel's update function to our list for resize handling
        carouselsToUpdateOnResize.push(() => updateContent(currentIndex));
        updateContent(0); // Initial setup
    }
    initializeSyncedCarousel('concept-carousel');
    initializeSyncedCarousel('development-carousel');
    
    // --- OPTIMIZATION: Single debounced resize handler for all carousels ---
    window.addEventListener('resize', debounce(() => {
        carouselsToUpdateOnResize.forEach(updateFn => updateFn());
    }, 200)); // 200ms delay is usually a good value

    
    // --- REFACTOR: COLLAPSIBLE SECTION LOGIC ---
    // This logic assumes sections start closed by default via CSS (`max-height: 0`).
    const triggers = document.querySelectorAll('.collapsible-trigger');
    
    triggers.forEach(trigger => {
        // Assume it starts collapsed as per CSS. Add the class for the icon state.
        trigger.classList.add('is-collapsed');
        const content = trigger.nextElementSibling;
        if (content) {
             content.style.maxHeight = null; // Ensure it's closed initially
        }

        trigger.addEventListener('click', function() {
            this.classList.toggle('is-collapsed');
            const content = this.nextElementSibling;
            
            // Check if content is open (has a maxHeight set)
            if (content.style.maxHeight) {
                // If it's open, close it
                content.style.maxHeight = null;
            } else {
                // If it's closed, open it to its natural height
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
});

// --- END OF FILE script.js ---
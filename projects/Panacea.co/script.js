// Performance optimization: Preload audio files
const preloadAudio = () => {
    const audioFiles = document.querySelectorAll('audio');
    audioFiles.forEach(audio => {
        try {
            audio.volume = 0.5; // Set reasonable volume
            audio.load();
        } catch (error) {
            console.warn('Failed to preload audio:', error);
        }
    });
};

// Debounce function for scroll events
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

document.addEventListener('DOMContentLoaded', () => {
    preloadAudio();
    
    // Cleanup tracking
    const intervals = [];
    const observers = [];
    const eventListeners = [];
    
    // Cache frequently used DOM elements
    const domCache = {
        productCards: document.querySelectorAll('.product-card'),
        headings: document.querySelectorAll('h1, h2, h3'),
        marqueeContents: document.querySelectorAll('.marquee-content'),
        popupTemplates: document.querySelectorAll('.popup-template')
    };
    
    // --- DYNAMIC COUNTDOWN TIMER ---
    const countdownEl = document.getElementById('countdown-timer');
    if (countdownEl) {
        // Start with a random time between 8-12 hours
        let totalSeconds = Math.floor(Math.random() * 14400) + 28800; // 8-12 hours in seconds
        
        const updateTimer = () => {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            countdownEl.textContent = `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
            
            if (totalSeconds > 0) {
                totalSeconds--;
            } else {
                // Reset to create false urgency
                totalSeconds = Math.floor(Math.random() * 3600) + 1800; // 30min-1hr
                countdownEl.parentElement.innerHTML = 'FLASH SALE EXTENDED! 47% Off All Products! Ends in: <span id="countdown-timer">30m 00s</span> ⚡';
            }
        };
        
        updateTimer();
        intervals.push(setInterval(updateTimer, 1000));
    }
    
    // --- FAKE LIVE ACTIVITY COUNTER ---
    const liveCounter = document.getElementById('live-counter');
    if (liveCounter) {
        let baseCount = 2847;
        intervals.push(setInterval(() => {
            // Randomly fluctuate the counter to create fake activity
            const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
            baseCount = Math.max(2800, Math.min(3000, baseCount + change));
            liveCounter.textContent = baseCount.toLocaleString();
        }, 3000));
    }

    // --- SEAMLESS CAROUSEL LOGIC ---
    const carouselTrack = document.querySelector('.carousel-track');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    if (carouselTrack && prevButton && nextButton) {
        const slidesData = [
             { id: 'banner-1', content: '<h1>Monetize Your Consciousness</h1><p>Introducing Clarity™. The revolutionary supplement that transforms fleeting thoughts into actionable deliverables.</p>', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&h=500&fit=crop' },
             { id: 'banner-2', content: '<h1>Curate a Better You</h1><p>With Panacea products, your personality is no longer a liability. Install a charisma that trends.</p>', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=500&fit=crop' },
             { id: 'banner-3', content: '<h1>Achieve Success for the Soul</h1><p>Silence the notifications of self-doubt. Our patented formula archives inadequacy. Permanently.</p>', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=500&fit=crop' },
             { id: 'banner-4', content: '<h1>Don\'t Just Live. Disrupt.</h1><p>Join the 1%. Not of wealth, but of optimized human existence. Your potential is our product.</p>', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&h=500&fit=crop' },
        ];

        const slides = slidesData.map(data => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.id = data.id;
            slide.style.background = data.gradient || '#333';
            slide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${data.img}')`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center';
            slide.innerHTML = `<div class="slide-content">${data.content}</div>`;
            return slide;
        });

        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[slides.length - 1].cloneNode(true);
        carouselTrack.append(lastClone, ...slides, firstClone);

        let allSlides = Array.from(carouselTrack.children);
        let slideWidth = allSlides[0].getBoundingClientRect().width;
        let currentIndex = 1;
        let isTransitioning = false;

        const updatePosition = () => { carouselTrack.style.transform = `translateX(-${slideWidth * currentIndex}px)`; };
        const moveToSlide = () => { isTransitioning = true; carouselTrack.style.transition = 'transform 0.5s ease-in-out'; updatePosition(); };

        updatePosition();

        nextButton.addEventListener('click', () => { if (isTransitioning) return; currentIndex++; moveToSlide(); });
        prevButton.addEventListener('click', () => { if (isTransitioning) return; currentIndex--; moveToSlide(); });

        carouselTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIndex === 0) { carouselTrack.style.transition = 'none'; currentIndex = slides.length; updatePosition(); }
            if (currentIndex === allSlides.length - 1) { carouselTrack.style.transition = 'none'; currentIndex = 1; updatePosition(); }
        });

        // RESPONSIVE FIX: Recalculate width on resize
        const resizeObserver = new ResizeObserver(entries => {
            window.requestAnimationFrame(() => {
                if (!entries || !entries.length) {
                    return;
                }
                slideWidth = allSlides[0].getBoundingClientRect().width;
                carouselTrack.style.transition = 'none';
                updatePosition();
            });
        });
        resizeObserver.observe(carouselTrack.parentElement);
        observers.push(resizeObserver);
    }

    // --- ENHANCED MARQUEE LOGIC ---
    domCache.marqueeContents.forEach(mc => { 
        const originalContent = mc.innerHTML;
        mc.innerHTML = originalContent + originalContent + originalContent + originalContent; // Duplicate 4x for seamless loop
    });


    // --- AESTHETIC DEGRADATION LOGIC ---
    const degradationTrigger = document.getElementById('degradation-trigger');
    if (degradationTrigger) {
        const degradationObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                document.body.classList.add('degraded');
                addDegradationEffects();
                degradationObserver.unobserve(degradationTrigger);
                // Trigger second level degradation after delay
                setTimeout(() => addDegradationEffects(), 3000);
            }
        }, { threshold: 0.5 });
        degradationObserver.observe(degradationTrigger);
        observers.push(degradationObserver);
    }

    // --- ENHANCED DEGRADATION EFFECTS ---
    let degradationLevel = 0;
    const addDegradationEffects = () => {
        degradationLevel++;
        if (degradationLevel === 1) {
            domCache.productCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = `shake 0.5s ease-in-out ${index * 0.1}s infinite`;
                }, index * 100);
            });
        } else if (degradationLevel === 2) {
            domCache.headings.forEach(heading => {
                heading.style.textTransform = 'uppercase';
                heading.style.letterSpacing = '2px';
            });
            // Add random marquee speeds
            domCache.marqueeContents.forEach(marquee => {
                marquee.style.animationDuration = `${Math.random() * 20 + 10}s`;
            });
        }
    };

    // --- RISING ACTION: ANNOYING UI LOGIC ---
    const risingActionTrigger = document.getElementById('rising-action-trigger');
    const cookieBanner = document.getElementById('cookie-banner');
    const newsletterPopup = document.getElementById('newsletter-popup');

    if (risingActionTrigger && cookieBanner && newsletterPopup) {
        const risingActionObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                cookieBanner.classList.add('active');
                setTimeout(() => newsletterPopup.classList.add('active'), 3000); // Slower initial popup
                risingActionObserver.unobserve(risingActionTrigger);
            }
        }, { threshold: 1.0 });

        risingActionObserver.observe(risingActionTrigger);
        observers.push(risingActionObserver);

        cookieBanner.querySelector('button').addEventListener('click', (e) => {
            // Check if this is the "I AGREE" button (not a close button)
            if (e.target.textContent.includes('AGREE')) {
                // Open Panacea.io in new tab
                window.open('https://panacea.io', '_blank', 'noopener,noreferrer');
            }
            cookieBanner.style.bottom = '-100px';
            setTimeout(() => { cookieBanner.style.bottom = '0'; }, 4000); // Slower return
        });

        let annoyanceLevel = 0;
        const positions = [
            { top: '30px', right: '30px', transform: 'translate(0, 0)', bottom: 'auto', left: 'auto' },
            { bottom: '30px', left: '30px', transform: 'translate(0, 0)', top: 'auto', right: 'auto' },
            { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bottom: 'auto', right: 'auto' }
        ];

        newsletterPopup.querySelector('.intrusive-close').addEventListener('click', () => {
            annoyanceLevel++;
            newsletterPopup.classList.remove('active');
            newsletterPopup.classList.remove('annoyance-1', 'annoyance-2', 'annoyance-3');
            setTimeout(() => {
                const newPos = positions[annoyanceLevel % positions.length];
                Object.assign(newsletterPopup.style, newPos);
                if (annoyanceLevel <= 3) { newsletterPopup.classList.add(`annoyance-${annoyanceLevel}`); }
                else { newsletterPopup.classList.add('annoyance-3'); }
                newsletterPopup.classList.add('active');
            }, 2000); // Slower reappearance
        });

        // Add click handler for newsletter signup button
        const signupBtn = newsletterPopup.querySelector('.newsletter-signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Open Panacea.io in new tab
                window.open('https://panacea.io', '_blank', 'noopener,noreferrer');
                // Hide the popup after signup
                newsletterPopup.classList.remove('active');
            });
        }
    }

    // --- SENSORY OVERLOAD & CRASH LOGIC ---
    const mainContent = document.getElementById('main-content');
    const glitchOverlay = document.getElementById('glitch-overlay');
    const finalSection = document.getElementById('final-section');
    const resetButton = document.getElementById('reset-button');
    const overloadTrigger = document.getElementById('overload-trigger');
    
    const overloadAudio = document.getElementById('overload-ambience');
    const sfx = [
        document.getElementById('sfx-1'),
        document.getElementById('sfx-2'),
        document.getElementById('sfx-3')
    ];

    if (mainContent && glitchOverlay && finalSection && resetButton && overloadTrigger && overloadAudio) {
        let attackStarted = false;
        const popupsToTriggerCrash = 25; // Allow slower, more dramatic escalation
        let popupsSpawned = 0;
        let crashInitiated = false;
        let spawnTimeout;

        // Enhanced glitch effects
        const triggerLiveGlitch = () => {
            mainContent.classList.add('glitch-active');
            if (popupsSpawned > 8) {
                document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) contrast(${1 + Math.random() * 0.5})`;
                setTimeout(() => { document.body.style.filter = ''; }, 150);
            }
            if (popupsSpawned > 12) {
                document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
                setTimeout(() => { document.body.style.transform = ''; }, 100);
            }
            setTimeout(() => { mainContent.classList.remove('glitch-active'); }, 200);
        };

        const createPopup = (isReactive = false) => {
            if (crashInitiated) return;
            popupsSpawned++;

            const template = domCache.popupTemplates[Math.floor(Math.random() * domCache.popupTemplates.length)];
            const newPopup = template.cloneNode(true);
            newPopup.id = ''; newPopup.className = 'popup-instance';

            const positions = [
                { top: `${Math.random() * 60 + 15}%`, left: `${Math.random() * 60 + 15}%` },
                { top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(1.2)' },
                { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
                { top: '20px', left: '20px' }
            ];
            const pos = positions[Math.floor(Math.random() * positions.length)];
            Object.assign(newPopup.style, pos);
            
            if (popupsSpawned > 5) {
                newPopup.style.zIndex = 1000 + popupsSpawned;
                if (Math.random() > 0.5) newPopup.classList.add('drifting');
            }
            if (popupsSpawned > 10) {
                newPopup.style.transform = (newPopup.style.transform || '') + ` rotate(${Math.random() * 10 - 5}deg)`;
            }

            const closeBtn = newPopup.querySelector('.popup-close');
            if (popupsSpawned > 8) {
                closeBtn.style.transform = 'scale(0.7)';
                closeBtn.style.opacity = '0.5';
            }
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.popup-instance').remove();
                const spawnCount = Math.min(popupsSpawned / 3, 4);
                for (let i = 0; i < spawnCount; i++) {
                    setTimeout(() => createPopup(true), i * 100);
                }
            });

            // Add click handler for popup action buttons (not close button)
            const actionBtn = newPopup.querySelector('.popup-button');
            if (actionBtn) {
                actionBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Open Panacea.io in new tab
                    window.open('https://panacea.io', '_blank', 'noopener,noreferrer');
                    // Remove the popup after click
                    e.target.closest('.popup-instance').remove();
                });
            }

            if (popupsSpawned > 7) {
                document.querySelectorAll('.popup-instance').forEach(popup => {
                    if (Math.random() > 0.7) {
                        popup.style.animation = 'shake 0.3s ease-in-out infinite';
                    }
                });
            }

            document.body.appendChild(newPopup);
            
            const countdownEl = newPopup.querySelector('.countdown-timer');
            if (countdownEl) {
                let seconds = 59;
                const countdownInterval = setInterval(() => {
                    seconds--;
                    countdownEl.textContent = `00:${seconds.toString().padStart(2, '0')}`;
                    if (seconds <= 0 || !document.body.contains(newPopup)) {
                        clearInterval(countdownInterval);
                    }
                }, 1000);
            }
            
            try { 
                const randomSfx = sfx[Math.floor(Math.random() * sfx.length)];
                if (randomSfx) {
                    randomSfx.play().catch(error => {
                        console.warn('Failed to play SFX:', error);
                    });
                }
            } catch(error) {
                console.warn('SFX play error:', error);
            }
            
            if (Math.random() > 0.5 || popupsSpawned > 10) {
                triggerLiveGlitch();
            }

            if (popupsSpawned >= popupsToTriggerCrash && !crashInitiated) {
                initiateGlitchTransition();
            }
        };
        
        const scheduleNextPopup = (delay) => {
            if (crashInitiated) return;
            clearTimeout(spawnTimeout);
            spawnTimeout = setTimeout(() => {
                createPopup();
                
                let nextDelay;
                if (popupsSpawned < 5) { nextDelay = delay * 0.98; } 
                else if (popupsSpawned < 12) { nextDelay = delay * 0.85; } 
                else { nextDelay = Math.max(250, delay * 0.7); }
                
                scheduleNextPopup(nextDelay);
            }, delay);
        };

        const reactiveScrollHandler = debounce(() => {
            if (Math.random() > 0.8) {
                createPopup(true);
            }
        }, 100);

        const startPopupAttack = () => {
            if (attackStarted) return;
            attackStarted = true;
            try {
                overloadAudio.play().catch(error => {
                    console.warn('Failed to play overload audio:', error);
                });
            } catch (error) {
                console.warn('Audio play error:', error);
            }
            scheduleNextPopup(6000); // Initial delay of 6 seconds
            window.addEventListener('scroll', reactiveScrollHandler);
        };

        const initiateGlitchTransition = () => {
            crashInitiated = true;
            clearTimeout(spawnTimeout);
            window.removeEventListener('scroll', reactiveScrollHandler);

            let audioVolume = overloadAudio.volume;
            const fadeOutInterval = setInterval(() => {
                audioVolume -= 0.1;
                if (audioVolume < 0) {
                    try {
                        overloadAudio.pause();
                    } catch (error) {
                        console.warn('Failed to pause audio:', error);
                    }
                    clearInterval(fadeOutInterval);
                } else {
                    try {
                        overloadAudio.volume = audioVolume;
                    } catch (error) {
                        console.warn('Failed to set audio volume:', error);
                    }
                }
            }, 100);

            domCache.headings.forEach(heading => {
                heading.classList.add('glitch-text');
                heading.setAttribute('data-text', heading.textContent);
            });
            
            mainContent.classList.add('is-corrupting');
            setTimeout(() => { glitchOverlay.style.display = 'block'; }, 1000);
            setTimeout(() => {
                mainContent.style.display = 'none';
                glitchOverlay.style.display = 'none';
                document.querySelectorAll('.popup-instance, .intrusive-element').forEach(el => el.remove());
                finalSection.style.display = 'flex';
                finalSection.style.opacity = '0';
                requestAnimationFrame(() => {
                    finalSection.style.transition = 'opacity 1s ease-in';
                    finalSection.style.opacity = '1';
                });
                setTimeout(() => { resetButton.classList.add('visible'); }, 15000);
            }, 2000);
        };

        const overloadObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                startPopupAttack();
                overloadObserver.unobserve(overloadTrigger);
            }
        }, { threshold: 1.0 });

        overloadObserver.observe(overloadTrigger);
        observers.push(overloadObserver);
        
        const resetHandler = () => { location.reload(); };
        resetButton.addEventListener('click', resetHandler);
        eventListeners.push({ element: resetButton, event: 'click', handler: resetHandler });
    }
    
    // Cleanup function for page unload
    const cleanup = () => {
        intervals.forEach(interval => clearInterval(interval));
        observers.forEach(observer => observer.disconnect());
        eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
    };
    
    // Add cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
});
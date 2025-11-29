const HEADER_HTML = `
<div class="title-bar">
    <div class="container">
        <a href="/index.html" class="title-link">
            <h1>ypt<span id="glitch-o-1">o</span>x.c<span id="glitch-o-2">o</span>m</h1>
        </a>
    </div>
</div>
<nav class="main-nav">
     <div class="container">
        <div class="nav-links-wrapper">
            <a href="/creation" class="nav-link" data-path="/creation">Creation</a>
            <span class="nav-separator">|</span>
            <a href="/experimentation" class="nav-link" data-path="/experimentation">Experimentation</a>
            <span class="nav-separator">|</span>
            <a href="/curation" class="nav-link" data-path="/curation">Curation</a>
        </div>
        <div class="header-controls">
            <button id="random-theme-btn" class="theme-control-btn" aria-label="Randomize theme">[R]</button>
            <a href="/index.html#about-me" class="theme-control-btn" aria-label="Scroll to about me section">[?]</a>
        </div>
    </div>
</nav>
`;

const FOOTER_HTML = `
<div class="container">
    <p>© <span id="current-year"></span> I own nothing.</p>
</div>
`;

function injectComponents() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        headerPlaceholder.innerHTML = HEADER_HTML;
        setActiveLink();
    }

    if (footerPlaceholder) {
        footerPlaceholder.innerHTML = FOOTER_HTML;
    }

    // Dispatch event to signal components are loaded
    document.dispatchEvent(new Event('componentsLoaded'));
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const linkPath = link.getAttribute('data-path');
        // Simple check: if current path starts with link path (handling sub-pages if any)
        // or exact match.
        if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
            link.classList.add('active');
        }
    });
}

// Run injection immediately if DOM is ready, or on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectComponents);
} else {
    injectComponents();
}

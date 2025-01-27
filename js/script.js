document.addEventListener('DOMContentLoaded', () => {
    if (document.readyState === 'complete') {
        initializeContent();
    } else {
        window.addEventListener('load', initializeContent);
    }
});

function initializeContent() {
    initializeAnimations();
    setupEventListeners();
    displaySubmittedNews();
}

function setupEventListeners() {
    // Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tabs button');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.news-card, .step, .stat-card').forEach(el => {
        observer.observe(el);
    });
}

function displaySubmittedNews() {
    const newsGrid = document.querySelector('.news-grid');
    if (!newsGrid) return;

    const savedNews = JSON.parse(localStorage.getItem('submittedNews') || '[]');
    
    if (savedNews.length === 0) return;

    savedNews.forEach(news => {
        const article = document.createElement('article');
        article.className = `news-card ${news.assessment === 'likely-true' ? 'verified' : 'false'}`;
        
        article.innerHTML = `
            <div class="news-image">
                <img src="${news.image}" alt="${news.title}" onerror="this.src='placeholder.jpg'">
                <span class="verification-badge">
                    ${news.assessment === 'likely-true' ? 'Verified' : 'False'}
                </span>
            </div>
            <div class="news-content">
                <h3>${news.title}</h3>
                <p>${news.content.substring(0, 100)}...</p>
                <div class="news-meta">
                    <span><i class="far fa-clock"></i> ${timeAgo(new Date(news.timestamp))}</span>
                    <span><i class="far fa-folder"></i> ${news.category}</span>
                </div>
            </div>
        `;
        
        newsGrid.insertBefore(article, newsGrid.firstChild);
    });
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    return 'Just now';
}

// Export functions for potential testing
export {
    initializeAnimations,
    displaySubmittedNews,
    timeAgo
};

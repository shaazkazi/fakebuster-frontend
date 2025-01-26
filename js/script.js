import { API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const root = document.documentElement;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    }

    const savedTheme = localStorage.getItem('theme') || 
        (prefersDarkScheme.matches ? 'dark' : 'light');
    setTheme(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const newTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
});

    
    // Function to set theme
    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
    }
    
    // Function to update theme icon
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(prefersDarkScheme.matches ? 'dark' : 'light');
    }
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

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
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animation Observer
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

// Add this to your existing DOMContentLoaded event listener
function displaySubmittedNews() {
    const newsGrid = document.querySelector('.news-grid');
    const savedNews = JSON.parse(localStorage.getItem('submittedNews') || '[]');
    
    savedNews.forEach(news => {
        const article = document.createElement('article');
        article.className = `news-card ${news.assessment === 'likely-true' ? 'verified' : 'false'}`;
        
        article.innerHTML = `
            <div class="news-image">
                <img src="${news.image}" alt="${news.title}">
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

// Call this function when page loads
displaySubmittedNews();

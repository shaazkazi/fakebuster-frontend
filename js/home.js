import { API_URL } from './config.js';

if (!API_URL) {
    console.error('API_URL is not defined. Please check your config.js file.');
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index.html')) {
        initializeHome();
    }
});

async function initializeHome() {
    try {
        await Promise.all([
            fetchLatestNews().catch(() => {}),
            fetchTrendingNews().catch(() => {}),
            fetchCategories().catch(() => {})
        ]);
        setupSearch();
        setupFilters();
        setupInfiniteScroll();
    } catch (error) {
        console.log('Some features may not be available');
    }
}


let currentPage = 1;
const newsPerPage = 9;

async function fetchLatestNews(filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: newsPerPage,
        });

        const response = await fetch(`${API_URL}/api/news?${queryParams}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        const newsGrid = document.getElementById('newsGrid');
        if (newsGrid) {
            if (currentPage === 1) {
                newsGrid.innerHTML = '';
            }
            
            displayNews(data.news, newsGrid);
            
            const loadMoreBtn = document.querySelector('.load-more-btn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = data.hasMore ? 'block' : 'none';
            }
        }
    } catch (error) {
        console.error('Failed to fetch latest news:', error);
    }
}

async function fetchTrendingNews() {
    try {
        const response = await fetch(`${API_URL}/api/news/trending`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const categories = await response.json();
        displayTrending(trending);
    } catch (err) {
        console.error('Error:', err);
    }
}

async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        const categories = await response.json();
        displayCategories(categories);
    } catch (err) {
        console.error('Error:', err);
    }
}


function displayNews(news, container) {
    if (container && Array.isArray(news)) {
        const newsHTML = news.map(item => `
            <article class="news-card ${item.assessment}" onclick="window.location.href='/news-detail.html?id=${item._id}'">
                <div class="news-image">
                    <img src="${item.imageUrl}" alt="${item.title}">
                    <span class="verification-badge ${item.assessment}">
                        ${formatStatus(item.assessment)}
                    </span>
                </div>
                <div class="news-content">
                    <h3>${item.title}</h3>
                    <p>${truncateText(item.content, 100)}</p>
                    <div class="news-meta">
                        <span>
                            <i class="far fa-clock"></i>
                            ${formatDate(item.createdAt)}
                        </span>
                        <span>
                            <i class="far fa-eye"></i>
                            ${item.views} views
                        </span>
                    </div>
                </div>
            </article>
        `).join('');
        
        container.insertAdjacentHTML('beforeend', newsHTML);
        initializeAnimations();
    }
}

function displayTrending(trending) {
    const trendingContainer = document.getElementById('trendingSection');
    if (trendingContainer && Array.isArray(trending)) {
        trendingContainer.innerHTML = trending.map(item => `
            <div class="trending-item">
                <span class="trending-number">#${item.rank}</span>
                <div class="trending-content">
                    <h4>${item.title}</h4>
                    <span class="trending-meta">${item.views} views</span>
                </div>
            </div>
        `).join('');
    }
}

function displayCategories(categories) {
    const categoryContainer = document.querySelector('.filter-tabs');
    if (categoryContainer && Array.isArray(categories)) {
        categoryContainer.innerHTML = `
            <button class="filter-btn active" data-category="all">All</button>
            ${categories.map(category => `
                <button class="filter-btn" data-category="${category.slug}">
                    ${category.name}
                </button>
            `).join('')}
        `;
        setupFilters();
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentPage = 1;
            fetchLatestNews({ search: e.target.value });
        }, 300));
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentPage = 1;
            fetchLatestNews({
                category: button.dataset.category,
                status: button.dataset.status
            });
        });
    });
}

function setupInfiniteScroll() {
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadMore();
            }
        });
    }, options);

    const loadMoreTrigger = document.querySelector('.load-more-trigger');
    if (loadMoreTrigger) {
        observer.observe(loadMoreTrigger);
    }
}

function loadMore() {
    currentPage++;
    fetchLatestNews();
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function truncateText(text, length) {
    return text.length > length ? 
        text.substring(0, length) + '...' : 
        text;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.news-card').forEach(card => {
        observer.observe(card);
    });
}

function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';
    errorContainer.textContent = message;
    document.body.appendChild(errorContainer);
    setTimeout(() => errorContainer.remove(), 3000);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchLatestNews,
        fetchTrendingNews,
        fetchCategories,
        displayNews,
        displayTrending,
        displayCategories,
        formatDate,
        formatStatus,
        truncateText
    };
}

import { API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const newsId = new URLSearchParams(window.location.search).get('id');
    if (newsId) {
        fetchNewsDetail(newsId);
        fetchRelatedPosts(newsId);
    }
    setupShareButtons();
    setupCommentForm();
});


async function fetchNewsDetail(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/news/${id}`);
        const news = await response.json();
        displayNewsDetail(news);
        updateViewCount(id);
    } catch (err) {
        console.error('Error:', err);
    }
}

function displayNewsDetail(news) {
    const elements = {
        category: document.querySelector('.category-tag'),
        title: document.querySelector('.article-title'),
        date: document.querySelector('.publish-date'),
        platform: document.querySelector('.source-platform'),
        status: document.querySelector('.verification-status'),
        image: document.querySelector('.article-image img'),
        content: document.querySelector('.article-content'),
        author: document.querySelector('.author-name'),
        views: document.querySelector('.view-count'),
        votes: document.querySelector('.vote-count')
    };

    Object.entries(elements).forEach(([key, element]) => {
        if (element && news[key]) {
            if (key === 'date') {
                element.textContent = formatDate(news.createdAt);
            } else if (key === 'status') {
                element.textContent = formatStatus(news.assessment);
                element.className = `verification-status ${news.assessment}`;
            } else if (key === 'image') {
                element.src = news.imageUrl;
            } else {
                element.textContent = news[key];
            }
        }
    });
}

function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platform = button.dataset.platform;
            const url = window.location.href;
            const title = document.querySelector('.article-title')?.textContent || '';
            
            const shareUrls = {
                twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                linkedin: `https://www.linkedin.com/shareArticle?url=${url}&title=${title}`,
                whatsapp: `https://wa.me/?text=${title} ${url}`
            };
            
            window.open(shareUrls[platform], '_blank');
        });
    });
}

async function fetchRelatedPosts(currentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/news/related/${currentId}`);
        const posts = await response.json();
        displayRelatedPosts(posts);
    } catch (err) {
        console.error('Error:', err);
    }
}

function displayRelatedPosts(posts) {
    const container = document.querySelector('.related-posts-list');
    if (container && Array.isArray(posts)) {
        container.innerHTML = posts.map(post => `
            <div class="related-post" onclick="window.location.href='/news-detail.html?id=${post._id}'">
                <img src="${post.imageUrl}" alt="${post.title}">
                <div class="related-post-info">
                    <h4>${post.title}</h4>
                    <span>${formatDate(post.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }
}

function setupCommentForm() {
    const form = document.querySelector('.comment-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = form.querySelector('textarea').value;
            const newsId = new URLSearchParams(window.location.search).get('id');
            
            try {
                const response = await fetch('http://localhost:5000/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ newsId, content })
                });
                
                if (response.ok) {
                    form.querySelector('textarea').value = '';
                    fetchComments(newsId);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        });
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

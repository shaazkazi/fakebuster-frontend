document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'index.html';
        return;
    }

    fetchPosts();
    setupSearch();
    setupFilters();
    setupNewPostButton();
});

async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:5000/api/news', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        displayPosts(data.news);
    } catch (err) {
        console.error('Error:', err);
        showNotification('Error fetching posts', 'error');
    }
}

function displayPosts(posts) {
    const tbody = document.getElementById('postsTableBody');
    if (tbody && Array.isArray(posts)) {
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.title}</td>
                <td>${post.category}</td>
                <td>
                    <span class="post-status status-${post.assessment}">
                        ${formatStatus(post.assessment)}
                    </span>
                </td>
                <td>${formatDate(post.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editPost('${post._id}')" class="action-btn edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deletePost('${post._id}')" class="action-btn delete">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="viewStats('${post._id}')" class="action-btn stats">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (e) => {
            const searchTerm = e.target.value.toLowerCase();
            try {
                const response = await fetch(`http://localhost:5000/api/news?search=${searchTerm}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                displayPosts(data.news);
            } catch (err) {
                console.error('Error:', err);
            }
        }, 300));
    }
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const filter = button.dataset.filter;
            try {
                const response = await fetch(`http://localhost:5000/api/news?filter=${filter}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                displayPosts(data.news);
            } catch (err) {
                console.error('Error:', err);
            }
        });
    });
}

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/news/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete post');
        
        fetchPosts();
        showNotification('Post deleted successfully', 'success');
    } catch (err) {
        console.error('Error:', err);
        showNotification('Failed to delete post', 'error');
    }
}

function editPost(id) {
    window.location.href = `submit-news.html?edit=${id}`;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

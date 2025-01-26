const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

let uploadedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    const submitPage = document.querySelector('.submit-container');
    if (!submitPage) return;

    const elements = {
        adminLogin: document.getElementById('adminLogin'),
        loginForm: document.getElementById('loginForm'),
        newsForm: document.getElementById('newsSubmissionForm'),
        sourceSelect: document.getElementById('newsSource'),
        websiteUrlField: document.getElementById('websiteUrl'),
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('mediaUpload'),
        previewArea: document.getElementById('previewArea')
    };

    // Check existing token
    const token = localStorage.getItem('token');
    if (token && elements.newsForm && elements.adminLogin) {
        elements.adminLogin.style.display = 'none';
        elements.newsForm.style.display = 'block';
    }

    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            if (formData.username === ADMIN_CREDENTIALS.username && 
                formData.password === ADMIN_CREDENTIALS.password) {
                try {
                    const response = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    if (!response.ok) throw new Error('Login failed');

                    const { token } = await response.json();
                    localStorage.setItem('token', token);
                    
                    elements.adminLogin.style.display = 'none';
                    elements.newsForm.style.display = 'block';
                } catch (err) {
                    alert('Login failed: ' + err.message);
                }
            } else {
                alert('Invalid credentials');
            }
        });
    }

    if (elements.uploadArea && elements.fileInput) {
        setupFileUpload(elements);
    }

    if (elements.sourceSelect && elements.websiteUrlField) {
        elements.sourceSelect.addEventListener('change', (e) => {
            elements.websiteUrlField.style.display = 
                e.target.value === 'website' ? 'block' : 'none';
        });
    }

    setupAssessmentOptions();

    if (elements.newsForm) {
        elements.newsForm.addEventListener('submit', handleFormSubmission);
    }

    initializeCharacterCounter('newsTitle', 100);
    initializeCharacterCounter('newsContent', 1000);
});

// Rest of your existing functions remain the same, but update handleFormSubmission:

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        return;
    }

    const formData = new FormData();
    const newsTitle = document.getElementById('newsTitle');
    const newsContent = document.getElementById('newsContent');
    const newsSource = document.getElementById('newsSource');
    const categoryInput = document.querySelector('input[name="category"]:checked');
    const assessmentOption = document.querySelector('.assessment-option.selected');

    if (!newsTitle || !newsContent || !newsSource || !categoryInput || !assessmentOption) {
        alert('Please fill in all required fields');
        return;
    }

    formData.append('title', newsTitle.value);
    formData.append('content', newsContent.value);
    formData.append('sourcePlatform', newsSource.value);
    formData.append('category', categoryInput.value);
    formData.append('assessment', assessmentOption.dataset.value);

    if (uploadedFile) {
        formData.append('image', uploadedFile);
    }

    try {
        const response = await fetch('http://localhost:5000/api/news', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            return;
        }

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Submission failed');
        }

        alert('News submitted successfully!');
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Error:', err);
        alert('Failed to submit news: ' + err.message);
    }
}

function setupAssessmentOptions() {
    const assessmentOptions = document.querySelectorAll('.assessment-option');
    assessmentOptions.forEach(option => {
        option.addEventListener('click', () => {
            assessmentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

function initializeCharacterCounter(elementId, limit) {
    const element = document.getElementById(elementId);
    if (element) {
        const counter = element.parentElement.querySelector('.character-count');
        element.addEventListener('input', function() {
            const count = this.value.length;
            counter.textContent = `${count}/${limit}`;
            counter.style.color = count > limit ? 'var(--danger)' : 'var(--gray-700)';
            this.style.borderColor = count > limit ? 'var(--danger)' : '';
        });
    }
}

function removeImage() {
    uploadedFile = null;
    const previewArea = document.getElementById('previewArea');
    const fileInput = document.getElementById('mediaUpload');
    if (previewArea) previewArea.innerHTML = '';
    if (fileInput) fileInput.value = '';
}

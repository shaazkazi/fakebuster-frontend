import { API_URL } from './config.js';

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

    setupLoginForm(elements);
    setupFileUpload(elements);
    setupSourceSelect(elements);
    setupAssessmentOptions();
    setupNewsForm(elements);
    initializeCharacterCounters();
});

function setupLoginForm(elements) {
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === ADMIN_CREDENTIALS.username && 
                password === ADMIN_CREDENTIALS.password) {
                const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWJiNzg0MjhjZDUyNjQ4ZjY5OWJmOWEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDY4ODE2MDB9.mocked';
                localStorage.setItem('token', mockToken);
                elements.adminLogin.style.display = 'none';
                elements.newsForm.style.display = 'block';
            } else {
                showNotification('Invalid credentials', 'error');
            }
        });
    }
}

function setupFileUpload(elements) {
    if (elements.uploadArea && elements.fileInput) {
        elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', handleFileUpload);
        setupDragAndDrop(elements);
    }
}

function setupDragAndDrop(elements) {
    elements.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.add('drag-over');
    });

    elements.uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
    });

    elements.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        elements.fileInput.files = e.dataTransfer.files;
        handleFileUpload({ target: { files: [file] } });
    });
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size should be less than 5MB', 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }

    uploadedFile = file;
    displayPreview(file);
}

function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('previewArea').innerHTML = `
            <div class="preview-item">
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-btn" onclick="removeImage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

function setupSourceSelect(elements) {
    if (elements.sourceSelect) {
        elements.sourceSelect.addEventListener('change', (e) => {
            const websiteUrlField = document.getElementById('websiteUrlField');
            if (websiteUrlField) {
                websiteUrlField.style.display = e.target.value === 'website' ? 'block' : 'none';
            }
        });
    }
}

function setupAssessmentOptions() {
    const options = document.querySelectorAll('.assessment-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

function setupNewsForm(elements) {
    if (elements.newsForm) {
        elements.newsForm.addEventListener('submit', handleFormSubmission);
    }
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login first', 'error');
        return;
    }

    const title = document.getElementById('newsTitle')?.value;
    const content = document.getElementById('newsContent')?.value;
    const sourcePlatform = document.getElementById('newsSource')?.value;
    const categoryElement = document.querySelector('input[name="category"]:checked');
    const assessmentElement = document.querySelector('.assessment-option.selected');

    if (!title || !content || !sourcePlatform || !categoryElement || !assessmentElement) {
        showNotification('Please fill all required fields', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('sourcePlatform', sourcePlatform);
    formData.append('category', categoryElement.value);
    formData.append('assessment', assessmentElement.dataset.value);
    formData.append('author', '65bb78428cd52648f699bf9a');

    if (uploadedFile) {
        formData.append('image', uploadedFile);
    }

    try {
        const response = await fetch(`${API_URL}/api/news`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (response.ok) {
            showNotification('News submitted successfully!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            throw new Error(data.message || 'Submission failed');
        }
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

function initializeCharacterCounters() {
    initializeCharacterCounter('newsTitle', 100);
    initializeCharacterCounter('newsContent', 1000);
}

function initializeCharacterCounter(elementId, limit) {
    const element = document.getElementById(elementId);
    if (element) {
        const counter = element.parentElement.querySelector('.character-count');
        element.addEventListener('input', function() {
            const count = this.value.length;
            counter.textContent = `${count}/${limit}`;
            counter.style.color = count > limit ? 'var(--danger)' : 'var(--gray-700)';
        });
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

window.removeImage = function() {
    uploadedFile = null;
    document.getElementById('previewArea').innerHTML = '';
    document.getElementById('mediaUpload').value = '';
};

export {
    handleFormSubmission,
    setupFileUpload,
    setupAssessmentOptions
};

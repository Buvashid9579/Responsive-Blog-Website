// Global variables for DOM elements and data
const blogListView = document.getElementById('blog-list-view');
const createEditView = document.getElementById('create-edit-view');
const blogDetailView = document.getElementById('blog-detail-view');
const blogListContainer = document.getElementById('blog-list');
const blogForm = document.getElementById('blog-form');
const blogIdInput = document.getElementById('blog-id');
const blogTitleInput = document.getElementById('blog-title');
const blogContentInput = document.getElementById('blog-content');
const formTitle = document.getElementById('form-title');
const detailTitle = document.getElementById('detail-title');
const detailDate = document.getElementById('detail-date');
const detailContent = document.getElementById('detail-content');
const homeLink = document.getElementById('home-link');
const addBlogBtn = document.getElementById('add-blog-btn');
const cancelBtn = document.getElementById('cancel-btn');
const backBtn = document.getElementById('back-btn');
const editBlogBtn = document.getElementById('edit-blog-btn');
const deleteBlogBtn = document.getElementById('delete-blog-btn');
const messageBox = document.getElementById('message-box');
const moodButtons = document.querySelectorAll('.mood-btn');
const moodResponse = document.getElementById('mood-response');

// State variables to manage the application's view and selected blog
let currentBlogId = null;

// Function to show a notification message
function showMessage(message, type = 'success') {
    messageBox.textContent = message;
    messageBox.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

// Function to switch between views
function switchView(view) {
    blogListView.classList.add('hidden');
    createEditView.classList.add('hidden');
    blogDetailView.classList.add('hidden');

    if (view === 'list') {
        blogListView.classList.remove('hidden');
    } else if (view === 'create-edit') {
        createEditView.classList.remove('hidden');
    } else if (view === 'detail') {
        blogDetailView.classList.remove('hidden');
    }
}

// Function to get all blogs from localStorage
function getBlogs() {
    const blogsJson = localStorage.getItem('blogs');
    return blogsJson ? JSON.parse(blogsJson) : [];
}

// Function to save blogs to localStorage
function saveBlogs(blogs) {
    localStorage.setItem('blogs', JSON.stringify(blogs));
}

// Function to render the list of blogs
function renderBlogList() {
    const blogs = getBlogs();
    blogListContainer.innerHTML = ''; // Clear the current list

    if (blogs.length === 0) {
        blogListContainer.innerHTML = '<p class="text-center text-color-light">No blogs found. Create one to get started!</p>';
        return;
    }

    blogs.forEach(blog => {
        const blogItem = document.createElement('div');
        blogItem.className = 'blog-item';
        blogItem.dataset.id = blog.id;

        const snippet = blog.content.substring(0, 150) + (blog.content.length > 150 ? '...' : '');

        blogItem.innerHTML = `
            <h3>${blog.title}</h3>
            <p>${snippet}</p>
            <a href="#" class="read-more" data-id="${blog.id}">Read More &rarr;</a>
        `;
        
        // Add event listener to the 'Read More' link
        blogItem.querySelector('.read-more').addEventListener('click', (e) => {
            e.preventDefault();
            showBlogDetail(blog.id);
        });

        blogListContainer.appendChild(blogItem);
    });
}

// Function to handle form submission (create or update blog)
function handleFormSubmit(e) {
    e.preventDefault();
    const blogs = getBlogs();
    const id = blogIdInput.value;
    const title = blogTitleInput.value;
    const content = blogContentInput.value;
    const date = new Date().toLocaleDateString();

    if (id) {
        // Update existing blog
        const blogIndex = blogs.findIndex(blog => blog.id === id);
        if (blogIndex > -1) {
            blogs[blogIndex].title = title;
            blogs[blogIndex].content = content;
            saveBlogs(blogs);
            showMessage('Blog updated successfully!');
        }
    } else {
        // Create new blog
        const newBlog = {
            id: crypto.randomUUID(), // Generate a unique ID for the new blog
            title,
            content,
            date
        };
        blogs.push(newBlog);
        saveBlogs(blogs);
        showMessage('Blog created successfully!');
    }

    // Reset form and return to list view
    blogForm.reset();
    renderBlogList();
    switchView('list');
}

// Function to show the detail view for a specific blog
function showBlogDetail(id) {
    const blogs = getBlogs();
    const blog = blogs.find(b => b.id === id);

    if (blog) {
        currentBlogId = id; // Store the ID for editing/deleting
        detailTitle.textContent = blog.title;
        detailDate.textContent = `Published on ${blog.date}`;
        detailContent.textContent = blog.content;
        switchView('detail');
    } else {
        showMessage('Blog not found!', 'error');
        switchView('list');
    }
}

// Function to show a custom confirmation modal
function showConfirmationModal(message, callback) {
    // Check if a modal already exists to prevent duplicates
    if (document.getElementById('custom-modal-overlay')) {
        return;
    }

    // Create the modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'custom-modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;

    // Create the modal content box
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        max-width: 400px;
        text-align: center;
        color: var(--text-color-dark);
    `;

    // Add the message and buttons
    modalContent.innerHTML = `
        <p style="margin: 0 0 1.5rem;">${message}</p>
        <div style="display: flex; justify-content: center; gap: 1rem;">
            <button id="modal-yes-btn" class="btn btn-secondary">Cancel</button>
            <button id="modal-no-btn" class="btn btn-primary">Yes, Delete</button>
        </div>
    `;

    // Append the content to the overlay and the overlay to the body
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Get the buttons and add event listeners
    const yesBtn = document.getElementById('modal-no-btn');
    const noBtn = document.getElementById('modal-yes-btn');

    yesBtn.addEventListener('click', () => {
        modalOverlay.remove();
        if (typeof callback === 'function') {
            callback();
        }
    });

    noBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });
}



// Event listeners for UI interactions and Mood Tracker Logic
document.addEventListener('DOMContentLoaded', () => {
    renderBlogList();
    // Initial view is the blog list
    switchView('list');

    // Event listener for the form submission
    blogForm.addEventListener('submit', handleFormSubmit);

    // Event listeners for navigation buttons
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        renderBlogList();
        switchView('list');
    });

    addBlogBtn.addEventListener('click', () => {
        formTitle.textContent = 'Create New Blog';
        blogIdInput.value = '';
        blogForm.reset();
        switchView('create-edit');
    });

    cancelBtn.addEventListener('click', () => {
        blogForm.reset();
        switchView('list');
    });

    backBtn.addEventListener('click', () => {
        renderBlogList();
        switchView('list');
    });

    editBlogBtn.addEventListener('click', () => {
        const blogs = getBlogs();
        const blogToEdit = blogs.find(b => b.id === currentBlogId);
        if (blogToEdit) {
            formTitle.textContent = 'Edit Blog';
            blogIdInput.value = blogToEdit.id;
            blogTitleInput.value = blogToEdit.title;
            blogContentInput.value = blogToEdit.content;
            switchView('create-edit');
        }
    });

    deleteBlogBtn.addEventListener('click', () => {
        // Show a custom confirmation modal instead of the native one
        showConfirmationModal('Are you sure you want to delete this blog?', () => {
            let blogs = getBlogs();
            blogs = blogs.filter(b => b.id !== currentBlogId);
            saveBlogs(blogs);
            showMessage('Blog deleted successfully!');
            renderBlogList();
            switchView('list');
        });
    });

    // Mood Tracker Logic
    const moodMessages = {
        happy: "That's wonderful! Your positivity is contagious.",
        inspired: "Glad to hear it! Creativity often strikes when you least expect it.",
        curious: "Perfect! A curious mind is a powerful tool for learning new things.",
        calm: "Take a deep breath. A peaceful mind is a clear mind."
    };

    moodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedMood = button.dataset.mood;
            moodResponse.textContent = moodMessages[selectedMood];
        });
    });
});

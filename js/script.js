// Smart Home Dashboard JavaScript
// Handles form validation, interactivity, and dynamic content

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initializeNavigation();
    initializeAuthSystem();
    initializeFormValidation();
    initializeInteractiveFeatures();
    initializeAnimations();
});

// Navigation Toggle for Mobile
function initializeNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');

            // Animate hamburger menu
            const spans = menuToggle.querySelectorAll('span');
            if (nav.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }
}

// Authentication System
function initializeAuthSystem() {
    // Check if user is already logged in
    checkLoginStatus();

    // Update navigation based on login status
    updateNavigationForAuth();
}

// User Storage System
const AuthSystem = {
    // Storage keys
    USERS_KEY: 'smarthome_users',
    CURRENT_USER_KEY: 'smarthome_current_user',

    // Get all users
    getUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    // Save users
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },

    // Add new user
    addUser(userData) {
        const users = this.getUsers();

        // Check if email already exists
        if (users.find(user => user.email === userData.email)) {
            throw new Error('Email already exists');
        }

        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    },

    // Authenticate user
    authenticateUser(email, password) {
        const users = this.getUsers();
        const user = users.find(user => user.email === email);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers(users);

        return user;
    },

    // Get current user
    getCurrentUser() {
        const userData = localStorage.getItem(this.CURRENT_USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    // Set current user (login)
    setCurrentUser(user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    },

    // Logout
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        updateNavigationForAuth();
        showSuccessMessage('Logged out successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }
};

// Check login status on page load
function checkLoginStatus() {
    const currentUser = AuthSystem.getCurrentUser();
    if (currentUser) {
        console.log('User is logged in:', currentUser.firstName);

        // If on login/signup pages and user is logged in, redirect to home
        if (window.location.pathname.includes('login.html') ||
            window.location.pathname.includes('signup.html')) {
            showSuccessMessage(`Welcome back, ${currentUser.firstName}!`);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
}

// Update navigation based on authentication status
function updateNavigationForAuth() {
    const currentUser = AuthSystem.getCurrentUser();
    const navList = document.querySelector('.nav ul');

    if (!navList) return;

    // Clear existing auth-related items (both static and dynamic)
    const authItems = navList.querySelectorAll('.auth-item');
    authItems.forEach(item => item.remove());

    // Also remove static login/signup links if they exist
    const staticLoginLink = navList.querySelector('a[href*="login.html"]');
    const staticSignupLink = navList.querySelector('a[href*="signup.html"]');

    if (staticLoginLink) staticLoginLink.parentElement.remove();
    if (staticSignupLink) staticSignupLink.parentElement.remove();

    if (currentUser) {
        // User is logged in - show welcome message and logout
        const welcomeItem = document.createElement('li');
        welcomeItem.className = 'auth-item';
        welcomeItem.innerHTML = `<span class="welcome-user">👋 Hi, ${currentUser.firstName}</span>`;

        const logoutItem = document.createElement('li');
        logoutItem.className = 'auth-item';
        logoutItem.innerHTML = `<a href="#" onclick="AuthSystem.logout()">Logout</a>`;

        navList.appendChild(welcomeItem);
        navList.appendChild(logoutItem);

        // Update hero section if on home page
        updateHeroForLoggedInUser(currentUser);
    } else {
        // User is not logged in - show login and signup
        const loginItem = document.createElement('li');
        loginItem.className = 'auth-item';
        loginItem.innerHTML = `<a href="login.html">Login</a>`;

        const signupItem = document.createElement('li');
        signupItem.className = 'auth-item';
        signupItem.innerHTML = `<a href="signup.html">Sign Up</a>`;

        navList.appendChild(loginItem);
        navList.appendChild(signupItem);
    }
}

// Update hero section for logged-in users
function updateHeroForLoggedInUser(user) {
    const heroContent = document.querySelector('.hero-content h1');
    if (heroContent && window.location.pathname.includes('index.html')) {
        heroContent.innerHTML = `Welcome back, ${user.firstName}! 👋<br><small style="font-size: 0.6em; opacity: 0.8;">Ready to control your smart home?</small>`;
    }
}

// Form Validation
function initializeFormValidation() {
    // Signup Form Validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateSignupForm()) {
                try {
                    // Get form data
                    const userData = {
                        firstName: document.getElementById('firstName').value.trim(),
                        lastName: document.getElementById('lastName').value.trim(),
                        email: document.getElementById('email').value.trim(),
                        phone: document.getElementById('phone').value.trim(),
                        password: document.getElementById('password').value
                    };

                    // Create user account
                    const newUser = AuthSystem.addUser(userData);

                    // Auto-login the user
                    AuthSystem.setCurrentUser(newUser);

                    showSuccessMessage('Account created successfully! Welcome to SmartHome.');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } catch (error) {
                    showErrorMessage(error.message);
                }
            }
        });

        // Real-time validation
        const inputs = signupForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    }

    // Login Form Validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateLoginForm()) {
                showLoading(this);

                // Get form data
                const email = document.getElementById('loginEmail').value.trim();
                const password = document.getElementById('loginPassword').value;
                const rememberMe = document.getElementById('rememberMe').checked;

                try {
                    // Authenticate user
                    const user = AuthSystem.authenticateUser(email, password);

                    // Set current user
                    AuthSystem.setCurrentUser(user);

                    setTimeout(() => {
                        showSuccessMessage(`Welcome back, ${user.firstName}!`);
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    }, 1000);
                } catch (error) {
                    // Reset loading state
                    const submitBtn = loginForm.querySelector('button[type="submit"]');
                    submitBtn.innerHTML = 'Sign In';
                    submitBtn.disabled = false;

                    showErrorMessage(error.message);
                }
            }
        });
    }

    // Contact Form Validation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateContactForm()) {
                showSuccessMessage('Message sent successfully! We\'ll get back to you soon.');
                contactForm.reset();
            }
        });
    }
}

// Field Validation Functions
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(fieldName + 'Error');

    if (!errorElement) return true;

    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (!value) {
                errorMessage = 'This field is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Must be at least 2 characters';
                isValid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                errorMessage = 'Only letters and spaces allowed';
                isValid = false;
            }
            break;

        case 'email':
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;

        case 'phone':
            if (!value) {
                errorMessage = 'Phone number is required';
                isValid = false;
            } else if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
            break;

        case 'password':
            if (!value) {
                errorMessage = 'Password is required';
                isValid = false;
            } else if (value.length < 8) {
                errorMessage = 'Password must be at least 8 characters';
                isValid = false;
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                errorMessage = 'Password must contain uppercase, lowercase, and number';
                isValid = false;
            }
            break;

        case 'confirmPassword':
            const password = document.getElementById('password').value;
            if (!value) {
                errorMessage = 'Please confirm your password';
                isValid = false;
            } else if (value !== password) {
                errorMessage = 'Passwords do not match';
                isValid = false;
            }
            break;
    }

    if (isValid) {
        errorElement.textContent = '';
        field.classList.remove('error');
        field.classList.add('success');
    } else {
        errorElement.textContent = errorMessage;
        field.classList.remove('success');
        field.classList.add('error');
    }

    return isValid;
}

// Form Validation Functions
function validateSignupForm() {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    let isValid = true;

    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });

    // Check terms agreement
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox && !termsCheckbox.checked) {
        showErrorMessage('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }

    // Check if email already exists
    if (isValid) {
        const email = document.getElementById('email').value.trim();
        const users = AuthSystem.getUsers();
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            showErrorMessage('An account with this email already exists');
            isValid = false;
        }
    }

    return isValid;
}

function validateLoginForm() {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let isValid = true;

    if (!validateField(email)) isValid = false;
    if (!password.value.trim()) {
        showErrorMessage('Password is required');
        isValid = false;
    }

    return isValid;
}

function validateContactForm() {
    const fields = ['contactFirstName', 'contactLastName', 'contactEmail', 'contactMessage'];
    let isValid = true;

    fields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });

    const subject = document.getElementById('contactSubject');
    if (subject && !subject.value) {
        showErrorMessage('Please select a subject');
        isValid = false;
    }

    return isValid;
}

// Interactive Features
function initializeInteractiveFeatures() {
    // Feature buttons
    const featureButtons = document.querySelectorAll('.feature-btn');
    featureButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.textContent.toLowerCase();
            handleFeatureAction(action);
        });
    });

    // Room selection
    const rooms = document.querySelectorAll('.room');
    rooms.forEach(room => {
        room.addEventListener('click', function() {
            rooms.forEach(r => r.classList.remove('active'));
            this.classList.add('active');
            updateRoomDisplay(this);
        });
    });

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value;
            if (email && validateEmail(email)) {
                showSuccessMessage('Thanks for subscribing! Check your email for updates.');
                this.reset();
            } else {
                showErrorMessage('Please enter a valid email address');
            }
        });
    }

    // Blog Read More functionality
    const readMoreLinks = document.querySelectorAll('.read-more');
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const blogCard = this.closest('.blog-card');
            const title = blogCard.querySelector('h3').textContent;
            showBlogPost(title);
        });
    });
}

// Feature Actions
function handleFeatureAction(action) {
    switch (action) {
        case 'toggle lights':
            toggleLights();
            break;
        case 'adjust temperature':
            adjustTemperature();
            break;
        case 'arm security':
            toggleSecurity();
            break;
        case 'play music':
            playMusic();
            break;
    }
}

function toggleLights() {
    const lightsOn = Math.random() > 0.5;
    if (lightsOn) {
        showSuccessMessage('Lights turned on! 💡');
    } else {
        showSuccessMessage('Lights turned off! 🌙');
    }
    animateFeatureButton('💡');
}

function adjustTemperature() {
    const newTemp = Math.floor(Math.random() * 10) + 68; // 68-77°F
    showSuccessMessage(`Temperature set to ${newTemp}°F 🌡️`);
    animateFeatureButton('🌡️');
}

function toggleSecurity() {
    showSuccessMessage('Security system armed! 🔒');
    animateFeatureButton('🔒');

    // Update security status
    const securityStatus = document.querySelector('.security-status');
    if (securityStatus) {
        securityStatus.classList.add('secure');
    }
}

function playMusic() {
    showSuccessMessage('Playing your favorite playlist! 🎵');
    animateFeatureButton('🎵');
}

function animateFeatureButton(icon) {
    // Create floating animation effect
    const features = document.querySelectorAll('.feature-card');
    features.forEach(feature => {
        if (feature.querySelector('.feature-icon').textContent === icon) {
            feature.style.animation = 'bounce 0.6s ease-in-out';
            setTimeout(() => {
                feature.style.animation = '';
            }, 600);
        }
    });
}

function updateRoomDisplay(roomElement) {
    const roomName = roomElement.querySelector('.room-name').textContent;
    const temp = roomElement.querySelector('.temp').textContent;
    showSuccessMessage(`${roomName} selected - Current temperature: ${temp}`);
}

// Utility Functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Style the message
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        ${type === 'success'
            ? 'background: linear-gradient(135deg, #10b981, #059669);'
            : 'background: linear-gradient(135deg, #ef4444, #dc2626);'
        }
    `;

    document.body.appendChild(messageDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

function showLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.innerHTML = '<span class="loading"></span> Signing in...';
    submitBtn.disabled = true;

    // Reset after timeout (in real app, this would be after API response)
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Animation Functions
function initializeAnimations() {
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .status-card, .team-member, .value-card, .blog-card, .faq-item');
    animatedElements.forEach(el => observer.observe(el));

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0, -30px, 0); }
            70% { transform: translate3d(0, -15px, 0); }
            90% { transform: translate3d(0, -4px, 0); }
        }

        .message {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .error {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .success {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
}

// Live Chat Simulation
function startLiveChat() {
    showSuccessMessage('Connecting to live chat... 💬');
    setTimeout(() => {
        showSuccessMessage('Live chat connected! How can we help you today?');
    }, 1000);
}

// Dynamic Content Updates
function updateDashboardData() {
    // Simulate real-time data updates
    const energyBar = document.querySelector('.energy-bar');
    if (energyBar) {
        const currentWidth = parseInt(energyBar.style.width) || 65;
        const newWidth = Math.max(20, Math.min(95, currentWidth + (Math.random() - 0.5) * 10));
        energyBar.style.width = newWidth + '%';

        const energyText = document.querySelector('.energy-meter + p');
        if (energyText) {
            energyText.textContent = Math.round(newWidth) + '% of daily limit';
        }
    }
}

// Initialize real-time updates (every 30 seconds)
setInterval(updateDashboardData, 30000);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search (if we had a search feature)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Could open search modal here
    }

    // Escape key to close modals/messages
    if (e.key === 'Escape') {
        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            msg.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            }, 300);
        });
    }
});

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for buttons
function addLoadingState(button) {
    const originalText = button.textContent;
    button.innerHTML = '<span class="loading"></span> Loading...';
    button.disabled = true;

    return () => {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Forgot Password Functionality
function showForgotPassword() {
    const email = prompt('Enter your email address to reset your password:');
    if (email && validateEmail(email)) {
        const users = AuthSystem.getUsers();
        const user = users.find(u => u.email === email);

        if (user) {
            // In a real app, this would send an email
            showSuccessMessage('Password reset instructions sent to your email!');
        } else {
            showErrorMessage('No account found with this email address.');
        }
    } else if (email) {
        showErrorMessage('Please enter a valid email address.');
    }
}

// Blog Post Content Database
const blogPosts = {
    'The Future of Smart Homes: What\'s Next in 2024': {
        author: 'Sarah Johnson',
        date: 'December 15, 2024',
        readTime: '5 min read',
        content: `
            <p>The smart home revolution is accelerating at an unprecedented pace. As we look ahead to 2024, several groundbreaking technologies are set to transform how we interact with our living spaces.</p>

            <h3>AI-Powered Home Assistants</h3>
            <p>Next-generation AI assistants will go beyond simple voice commands. They'll anticipate your needs, learn your preferences, and proactively manage your home environment. Imagine your home adjusting lighting and temperature based on your mood, detected through subtle cues like your voice tone or movement patterns.</p>

            <h3>Seamless Device Integration</h3>
            <p>The "Internet of Things" will become the "Internet of Everything" as smart home devices achieve true interoperability. Your refrigerator will communicate with your grocery delivery service, and your thermostat will coordinate with your electric vehicle charging schedule.</p>

            <h3>Sustainable Smart Living</h3>
            <p>Energy efficiency takes center stage with AI-driven consumption optimization. Smart homes will automatically reduce energy usage during peak hours, contribute to grid stability, and even earn you money through smart grid programs.</p>

            <p>The future of smart homes isn't just about convenience—it's about creating living spaces that are more efficient, sustainable, and attuned to human needs than ever before.</p>
        `
    },
    '10 Smart Lighting Tips for Energy Savings': {
        author: 'Mike Chen',
        date: 'December 10, 2024',
        readTime: '3 min read',
        content: `
            <p>Smart lighting isn't just about convenience—it's a powerful tool for reducing energy costs and environmental impact. Here are 10 practical tips to maximize your smart lighting investment.</p>

            <h3>1. Schedule Your Lights</h3>
            <p>Use scheduling features to automatically turn lights off during work hours or when you're away. This simple step can reduce energy usage by up to 30%.</p>

            <h3>2. Motion Sensors for Efficiency</h3>
            <p>Install motion sensors in hallways, bathrooms, and garages. Lights will only turn on when needed, eliminating wasted energy from forgotten lights.</p>

            <h3>3. Daylight Harvesting</h3>
            <p>Configure your smart lights to dim or turn off when there's sufficient natural light. This maintains optimal lighting while conserving energy.</p>

            <h3>4. Color Temperature Optimization</h3>
            <p>Use warmer color temperatures in the evening (around 2700K) to promote better sleep, and cooler temperatures (4000K+) during work hours for better concentration.</p>

            <h3>5. Group Control</h3>
            <p>Create lighting groups for different rooms or activities. Turn off entire groups with a single command rather than controlling individual lights.</p>

            <h3>6. Adaptive Brightness</h3>
            <p>Set lights to automatically adjust brightness based on time of day. Brighter during the day, softer in the evening.</p>

            <h3>7. Vacation Mode</h3>
            <p>Use random scheduling during vacations to simulate occupancy and deter potential intruders while saving energy.</p>

            <h3>8. Smart Bulb Selection</h3>
            <p>Choose LED bulbs with high lumens per watt efficiency. Look for ENERGY STAR certified smart bulbs for maximum savings.</p>

            <h3>9. Integration with Other Systems</h3>
            <p>Connect your lighting to your smart home security system. Lights can automatically turn on when security alerts are triggered.</p>

            <h3>10. Regular Maintenance</h3>
            <p>Clean your light fixtures regularly and replace bulbs at the first sign of dimming. Well-maintained lights are more energy efficient.</p>

            <p>Implementing these tips can lead to significant energy savings while enhancing your home's comfort and security.</p>
        `
    },
    'Smart Security: Protecting Your Home in the Digital Age': {
        author: 'Dr. Emily Rodriguez',
        date: 'December 8, 2024',
        readTime: '4 min read',
        content: `
            <p>As our homes become more connected, security concerns evolve alongside technological advancements. Smart security systems offer unprecedented protection, but they require careful implementation and maintenance.</p>

            <h3>Layers of Protection</h3>
            <p>Modern smart security goes beyond traditional locks and cameras. It encompasses multiple layers: physical barriers, digital monitoring, and intelligent automation that works together to protect your home.</p>

            <h3>Smart Locks and Access Control</h3>
            <p>Digital locks offer keyless entry with unique codes for family members, cleaning services, and guests. Features like automatic locking and tamper alerts provide additional security layers.</p>

            <h3>Advanced Camera Systems</h3>
            <p>AI-powered cameras can distinguish between people, animals, and objects. They offer facial recognition, motion tracking, and can send intelligent alerts instead of constant notifications.</p>

            <h3>Environmental Monitoring</h3>
            <p>Smart security extends to environmental threats. Sensors detect smoke, carbon monoxide, water leaks, and extreme temperatures, alerting you before small issues become major problems.</p>

            <h3>Integration and Automation</h3>
            <p>The true power of smart security lies in integration. When a security camera detects motion, it can automatically turn on lights, sound an alarm, and notify authorities if needed.</p>

            <h3>Privacy Considerations</h3>
            <p>While smart security enhances protection, it's crucial to maintain privacy. Choose systems with local storage options, strong encryption, and clear data policies.</p>

            <p>Smart security isn't just about technology—it's about creating a comprehensive protection strategy that keeps pace with our increasingly connected world.</p>
        `
    },
    'Climate Control: Smart Ways to Stay Comfortable': {
        author: 'Sarah Johnson',
        date: 'December 5, 2024',
        readTime: '3 min read',
        content: `
            <p>Smart thermostats have revolutionized home climate control, offering unprecedented comfort and efficiency. But maximizing their potential requires understanding how to use them effectively.</p>

            <h3>Learning Your Schedule</h3>
            <p>Modern smart thermostats learn your habits and preferences. After a week of normal use, they can automatically adjust temperatures based on your patterns, ensuring comfort when you need it most.</p>

            <h3>Geofencing Technology</h3>
            <p>Using your smartphone's location, your thermostat knows when you're coming home and can prepare the perfect temperature. It also conserves energy when you're away.</p>

            <h3>Room-by-Room Zoning</h3>
            <p>Different rooms have different heating and cooling needs. Smart zoning allows you to maintain different temperatures in various areas of your home, optimizing both comfort and efficiency.</p>

            <h3>Integration with Weather</h3>
            <p>Weather-aware thermostats adjust settings based on outdoor conditions. They pre-heat or pre-cool your home before extreme weather arrives, maintaining comfort while minimizing energy use.</p>

            <h3>Smart Vents and Zoning</h3>
            <p>Smart vents work with your thermostat to direct airflow where it's needed most. Close vents in unused rooms and open them in occupied spaces for optimal efficiency.</p>

            <h3>Humidity Control</h3>
            <p>Many smart thermostats also control humidity levels. Maintaining optimal humidity (30-50%) improves comfort and prevents mold growth and dust mite proliferation.</p>

            <h3>Energy Reports and Insights</h3>
            <p>Track your energy usage patterns and receive tips for optimization. Smart thermostats provide detailed reports showing how small adjustments can lead to significant savings.</p>

            <p>The key to smart climate control is finding the right balance between comfort, convenience, and efficiency.</p>
        `
    },
    'Creating the Perfect Smart Home Entertainment System': {
        author: 'Mike Chen',
        date: 'December 3, 2024',
        readTime: '5 min read',
        content: `
            <p>A well-designed smart home entertainment system seamlessly blends technology with your lifestyle, creating an immersive experience that enhances every moment of leisure.</p>

            <h3>Centralized Control</h3>
            <p>The foundation of any great entertainment system is unified control. A central hub that manages all your devices ensures everything works together harmoniously.</p>

            <h3>Multi-Room Audio</h3>
            <p>Smart speakers and audio systems allow you to play music throughout your home. Group speakers for synchronized playback or play different content in different rooms.</p>

            <h3>Smart TVs and Streaming</h3>
            <p>Modern smart TVs integrate with streaming services, voice assistants, and home automation systems. They can display security camera feeds, weather information, or family photos when not in use.</p>

            <h3>Automated Scenes</h3>
            <p>Create entertainment scenes that adjust lighting, sound, and displays for different activities. Movie night dims the lights and sets the perfect audio balance, while dinner parties create ambient lighting and background music.</p>

            <h3>Voice Control Integration</h3>
            <p>Voice assistants make entertainment control effortless. Change channels, adjust volume, or search for content using natural language commands.</p>

            <h3>Smart Lighting for Ambiance</h3>
            <p>Entertainment isn't just about sound and video—lighting plays a crucial role. Smart lighting can create the perfect ambiance for movies, gaming, or casual viewing.</p>

            <h3>Seamless Integration</h3>
            <p>The best entertainment systems disappear into the background, becoming invisible servants that enhance your experience without demanding attention.</p>

            <p>Designing the perfect smart home entertainment system requires careful planning, but the result is a home that truly understands and caters to your entertainment needs.</p>
        `
    },
    'Sustainable Living with Smart Home Technology': {
        author: 'Dr. Emily Rodriguez',
        date: 'December 1, 2024',
        readTime: '4 min read',
        content: `
            <p>Smart home technology offers unprecedented opportunities for sustainable living, helping us reduce our environmental impact while maintaining modern comforts.</p>

            <h3>Energy Monitoring and Optimization</h3>
            <p>Smart meters and energy monitoring systems provide real-time insights into your consumption patterns. This awareness alone can reduce energy usage by 10-15%.</p>

            <h3>Automated Efficiency</h3>
            <p>Smart systems automatically optimize energy usage. Lights turn off when rooms are empty, thermostats adjust based on occupancy, and appliances run during off-peak hours.</p>

            <h3>Renewable Energy Integration</h3>
            <p>Smart homes can seamlessly integrate with solar panels, wind turbines, and other renewable sources. They optimize energy storage and usage to maximize renewable consumption.</p>

            <h3>Water Conservation</h3>
            <p>Smart irrigation systems and leak detectors prevent water waste. Smart showers and faucets reduce water usage while maintaining comfort.</p>

            <h3>Waste Reduction</h3>
            <p>Smart refrigerators can track expiration dates and suggest recipes, while smart trash cans can sort recyclables and alert you when bins need emptying.</p>

            <h3>Carbon Footprint Tracking</h3>
            <p>Advanced systems can calculate and track your household's carbon footprint, providing insights and recommendations for further reduction.</p>

            <h3>Community Impact</h3>
            <p>When multiple smart homes connect to form microgrids, they can collectively stabilize the power grid and share renewable energy resources.</p>

            <p>Smart home technology isn't just about convenience—it's becoming an essential tool for creating sustainable, environmentally responsible living spaces.</p>
        `
    },
    'Smart Homes for Families: Tips for Every Age Group': {
        author: 'Sarah Johnson',
        date: 'November 28, 2024',
        readTime: '4 min read',
        content: `
            <p>Smart home technology can benefit every member of the family, from tech-savvy teenagers to aging parents. The key is choosing solutions that adapt to different needs and abilities.</p>

            <h3>For Young Children</h3>
            <p>Safe, simple interfaces with large buttons and voice control. Smart locks prevent wandering, while night lights with timers provide comfort and security.</p>

            <h3>For Teenagers</h3>
            <p>Gaming-optimized lighting and audio systems, study timers that gradually increase room brightness, and smart appliances that help with chores and meal preparation.</p>

            <h3>For Adults</h3>
            <p>Comprehensive automation for busy schedules, health monitoring through smart scales and fitness equipment, and seamless integration with work-from-home setups.</p>

            <h3>For Seniors</h3>
            <p>Voice-activated controls for those with mobility challenges, medication reminders through smart assistants, and emergency detection systems that can alert family members.</p>

            <h3>Universal Design Principles</h3>
            <p>Choose systems with multiple control methods: voice, touch, and mobile apps. Ensure interfaces are intuitive and that help is always available.</p>

            <h3>Privacy and Safety</h3>
            <p>Implement family-friendly privacy controls, such as camera zones that avoid bedrooms and bathrooms, and create user profiles with appropriate permissions.</p>

            <h3>Education and Adoption</h3>
            <p>Start with simple, visible benefits like smart lighting and gradually introduce more complex features. Provide training and support to ensure everyone can participate.</p>

            <p>The most successful smart homes are those that enhance family life for everyone, adapting to individual needs while creating shared experiences and security.</p>
        `
    }
};

// Show Blog Post Modal
function showBlogPost(title) {
    const post = blogPosts[title];
    if (!post) {
        showErrorMessage('Blog post not found');
        return;
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'blog-modal-overlay';
    modal.innerHTML = `
        <div class="blog-modal">
            <div class="blog-modal-header">
                <h2>${title}</h2>
                <button class="modal-close" onclick="closeBlogModal()">&times;</button>
            </div>
            <div class="blog-modal-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${post.date}</span>
                <span class="read-time">${post.readTime}</span>
            </div>
            <div class="blog-modal-content">
                ${post.content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add modal styles if not already present
    if (!document.querySelector('#blog-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'blog-modal-styles';
        styles.textContent = `
            .blog-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: fadeIn 0.3s ease-out;
            }

            .blog-modal {
                background: white;
                border-radius: 12px;
                max-width: 800px;
                max-height: 80vh;
                width: 90%;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                animation: slideIn 0.3s ease-out;
            }

            .blog-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 2rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .blog-modal-header h2 {
                margin: 0;
                color: #1f2937;
                font-size: 1.875rem;
                line-height: 1.2;
            }

            .modal-close {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .blog-modal-meta {
                padding: 0 2rem;
                display: flex;
                gap: 1rem;
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 1rem;
            }

            .blog-modal-content {
                padding: 0 2rem 2rem;
                line-height: 1.7;
                color: #374151;
            }

            .blog-modal-content h3 {
                margin-top: 2rem;
                margin-bottom: 1rem;
                color: #1f2937;
                font-size: 1.25rem;
            }

            .blog-modal-content p {
                margin-bottom: 1rem;
            }

            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(styles);
    }

    // Close modal when clicking overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeBlogModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeBlogModal();
        }
    });
}

// Close Blog Modal
function closeBlogModal() {
    const modal = document.querySelector('.blog-modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Export functions for potential use in other scripts
window.SmartHome = {
    showSuccessMessage,
    showErrorMessage,
    validateEmail,
    startLiveChat,
    AuthSystem
};

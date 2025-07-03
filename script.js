// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Initialize based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'login.html':
            initializeLoginForm();
            break;
        case 'athlete-signup.html':
            initializeAthleteForm();
            break;
        case 'investor-signup.html':
            initializeInvestorForm();
            break;
        case 'dashboard.html':
            initializeAthleteDashboard();
            break;
        case 'investor-dashboard.html':
            initializeInvestorDashboard();
            break;
        case 'athlete-profile.html':
            initializeAthleteProfile();
            break;
        case 'messages.html':
            initializeMessages();
            break;
        case 'settings.html':
            initializeSettings();
            break;
        case 'my-investments.html':
            initializeMyInvestments();
            break;
        default:
            initializeHomePage();
    }
    
    // Initialize common features
    initializeFormValidation();
    initializeScrollAnimations();
    initializeNavigation();
});

// Global variable to store current modal athlete
let currentModalAthlete = null;
let currentModalInvestor = null;

// Authentication functions
function checkAuthStatus() {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        updateNavigation(currentUser);
        updateUserName(currentUser);
    }
}

function updateNavigation(user) {
    const navUserName = document.getElementById('navUserName');
    if (navUserName) {
        navUserName.textContent = `${user.firstName} ${user.lastName}`;
    }
}

function updateUserName(user) {
    const elements = document.querySelectorAll('[id*="UserName"], [id*="userName"]');
    elements.forEach(element => {
        element.textContent = `${user.firstName} ${user.lastName}`;
    });
}

// Login form
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            const user = db.loginUser(email, password);
            
            if (user) {
                showSuccessMessage('Login successful! Redirecting...');
                
                setTimeout(() => {
                    if (user.userType === 'athlete') {
                        window.location.href = 'dashboard.html';
                    } else if (user.userType === 'investor') {
                        window.location.href = 'investor-dashboard.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showErrorMessage('Invalid email or password. Please try again.');
            }
        });
    }
}

// Athlete form
function initializeAthleteForm() {
    const athleteForm = document.getElementById('athleteForm');
    
    if (athleteForm) {
        athleteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!athleteForm.checkValidity()) {
                athleteForm.classList.add('was-validated');
                return;
            }
            
            const submitBtn = athleteForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<div class="loading me-2"></div>Creating Profile...';
            submitBtn.disabled = true;
            
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                userType: 'athlete',
                role: document.getElementById('role').value,
                sport: document.getElementById('sport').value,
                age: parseInt(document.getElementById('age').value),
                location: document.getElementById('location').value,
                bio: document.getElementById('bio').value,
                achievements: document.getElementById('achievements').value,
                socialFollowers: parseInt(document.getElementById('socialFollowers').value) || 0,
                socialLinks: document.getElementById('socialLinks').value,
                videoHighlights: document.getElementById('videoHighlights').value,
                fundingGoal: parseInt(document.getElementById('fundingGoal').value) || 0,
                fundingPurpose: document.getElementById('fundingPurpose').value,
                kyc: document.getElementById('kyc').files[0]?.name || 'No file uploaded'
            };
            
            setTimeout(() => {
                const user = db.createUser(formData);
                showSuccessMessage('Profile created successfully! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }, 1500);
        });
    }
}

// Investor form
function initializeInvestorForm() {
    const investorForm = document.getElementById('investorForm');
    
    if (investorForm) {
        investorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!investorForm.checkValidity()) {
                investorForm.classList.add('was-validated');
                return;
            }
            
            const submitBtn = investorForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<div class="loading me-2"></div>Creating Profile...';
            submitBtn.disabled = true;
            
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                userType: 'investor',
                company: document.getElementById('company').value,
                investorType: document.getElementById('investorType').value,
                accreditation: document.getElementById('accreditation').value,
                minInvestment: parseInt(document.getElementById('minInvestment').value) || 0,
                maxInvestment: parseInt(document.getElementById('maxInvestment').value) || 0,
                sportFocus: Array.from(document.getElementById('sportFocus').selectedOptions).map(option => option.value),
                investmentCriteria: document.getElementById('investmentCriteria').value,
                experience: document.getElementById('experience').value,
                linkedIn: document.getElementById('linkedIn').value,
                kyc: document.getElementById('kyc').files[0]?.name || 'No file uploaded'
            };
            
            setTimeout(() => {
                const user = db.createUser(formData);
                showSuccessMessage('Profile created successfully! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }, 1500);
        });
    }
}

// Athlete dashboard
function initializeAthleteDashboard() {
    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.userType !== 'athlete') {
        window.location.href = 'login.html';
        return;
    }
    
    const athlete = db.getAthleteByUserId(currentUser.id);
    if (athlete) {
        loadAthleteDashboardData(athlete);
    }
    
    // Load potential investors
    loadPotentialInvestors();
}

function loadAthleteDashboardData(athlete) {
    // Update header
    const nameHeader = document.getElementById('athleteNameHeader');
    if (nameHeader) {
        nameHeader.textContent = athlete.firstName;
    }
    
    // Update stats
    document.getElementById('totalRaised').textContent = `$${athlete.fundingRaised.toLocaleString()}`;
    document.getElementById('fundingGoal').textContent = `$${athlete.fundingGoal.toLocaleString()}`;
    document.getElementById('investorCount').textContent = athlete.investorCount;
    document.getElementById('profileViews').textContent = athlete.profileViews;
    
    // Update progress bars
    const progress = athlete.fundingGoal > 0 ? (athlete.fundingRaised / athlete.fundingGoal) * 100 : 0;
    document.getElementById('fundingProgress').style.width = `${progress}%`;
    document.getElementById('raisedAmount').textContent = athlete.fundingRaised.toLocaleString();
    document.getElementById('goalAmount').textContent = athlete.fundingGoal.toLocaleString();
    
    // Load recent activity
    loadRecentActivity(athlete.id);
    loadRecentMessages(athlete.userId);
}

function loadPotentialInvestors() {
    const investorsContainer = document.getElementById('potentialInvestors');
    if (!investorsContainer) return;
    
    console.log('Loading potential investors...'); // Debug log
    
    const investors = db.getAllInvestors();
    console.log('Found investors:', investors.length); // Debug log
    
    if (investors.length === 0) {
        investorsContainer.innerHTML = '<p class="text-muted">No investors available. <button class="btn btn-link p-0" onclick="window.refreshData()">Refresh Data</button></p>';
        return;
    }
    
    const investorsHtml = investors.map(investor => `
        <div class="potential-investor mb-3 p-3 border rounded" style="cursor: pointer; transition: all 0.3s ease;">
            <div class="d-flex align-items-start">
                <div class="investor-avatar me-3">
                    <div class="profile-avatar" style="width: 50px; height: 50px; font-size: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        ${investor.firstName[0]}${investor.lastName[0]}
                    </div>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${investor.firstName} ${investor.lastName}</h6>
                    <p class="text-muted small mb-1">${investor.company} • ${investor.investorType.toUpperCase()}</p>
                    <p class="small mb-2">${investor.bio.substring(0, 120)}...</p>
                    <div class="investor-stats mb-2">
                        <small class="text-success me-3">
                            <i class="fas fa-users me-1"></i>${investor.athletesFunded} athletes funded
                        </small>
                        <small class="text-primary">
                            <i class="fas fa-percentage me-1"></i>${investor.successRate}% success rate
                        </small>
                    </div>
                    <div class="investment-range mb-2">
                        <small class="text-info">
                            <i class="fas fa-dollar-sign me-1"></i>Investment: $${investor.minInvestment.toLocaleString()} - $${investor.maxInvestment.toLocaleString()}
                        </small>
                    </div>
                    <div class="sport-focus mb-2">
                        <small class="text-warning">
                            <i class="fas fa-trophy me-1"></i>Focus: ${investor.sportFocus.join(', ')}
                        </small>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-outline-primary btn-sm me-2" onclick="event.stopPropagation(); contactInvestor('${investor.id}')">
                            <i class="fas fa-envelope me-1"></i>Contact
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="event.stopPropagation(); viewInvestorDetails('${investor.id}')">
                            <i class="fas fa-eye me-1"></i>View Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    investorsContainer.innerHTML = investorsHtml;
    console.log('Investors loaded successfully!'); // Debug log
}

// Добавить в script.js после функции loadPotentialInvestors()

function viewAllInvestors() {
    const investors = db.getAllInvestors();
    const modal = document.getElementById('allInvestorsModal');
    const investorsList = document.getElementById('allInvestorsList');
    
    if (investors.length === 0) {
        investorsList.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No investors available.</p>
                <button class="btn btn-outline-primary" onclick="window.refreshData()">
                    <i class="fas fa-refresh me-2"></i>Refresh Data
                </button>
            </div>
        `;
    } else {
        const investorsHtml = investors.map(investor => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3">
                            <div class="profile-avatar me-3" style="width: 50px; height: 50px; font-size: 1rem;">
                                ${investor.firstName[0]}${investor.lastName[0]}
                            </div>
                            <div>
                                <h6 class="mb-0">${investor.firstName} ${investor.lastName}</h6>
                                <small class="text-muted">${investor.company}</small>
                            </div>
                        </div>
                        
                        <p class="small mb-3">${investor.bio.substring(0, 100)}...</p>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between small mb-1">
                                <span class="text-success">
                                    <i class="fas fa-users me-1"></i>${investor.athletesFunded} funded
                                </span>
                                <span class="text-primary">
                                    <i class="fas fa-percentage me-1"></i>${investor.successRate}%
                                </span>
                            </div>
                            <div class="small text-info">
                                <i class="fas fa-dollar-sign me-1"></i>$${investor.minInvestment.toLocaleString()} - $${investor.maxInvestment.toLocaleString()}
                            </div>
                            <div class="small text-warning mt-1">
                                <i class="fas fa-trophy me-1"></i>${investor.sportFocus.slice(0, 2).join(', ')}${investor.sportFocus.length > 2 ? '...' : ''}
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary btn-sm" onclick="contactInvestor('${investor.id}')">
                                <i class="fas fa-envelope me-1"></i>Contact
                            </button>
                            <button class="btn btn-outline-info btn-sm" onclick="viewInvestorDetails('${investor.id}')">
                                <i class="fas fa-eye me-1"></i>View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        investorsList.innerHTML = investorsHtml;
    }
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Улучшенная функция loadPotentialInvestors
function loadPotentialInvestors() {
    const investorsContainer = document.getElementById('potentialInvestors');
    if (!investorsContainer) return;
    
    console.log('Loading potential investors...'); // Debug log
    
    // Убеждаемся, что данные загружены из localStorage
    const investors = db.getAllInvestors();
    console.log('Found investors:', investors.length); // Debug log
    
    if (investors.length === 0) {
        investorsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-users fa-2x text-muted mb-3"></i>
                <p class="text-muted">No investors available</p>
                <button class="btn btn-outline-primary btn-sm" onclick="window.refreshData()">
                    <i class="fas fa-refresh me-2"></i>Refresh Data
                </button>
            </div>
        `;
        return;
    }
    
    // Показываем первых 3-4 инвестора
    const displayInvestors = investors.slice(0, 4);
    
    const investorsHtml = displayInvestors.map(investor => `
        <div class="potential-investor mb-3 p-3 border rounded" style="cursor: pointer; transition: all 0.3s ease;">
            <div class="d-flex align-items-start">
                <div class="investor-avatar me-3">
                    <div class="profile-avatar" style="width: 50px; height: 50px; font-size: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        ${investor.firstName[0]}${investor.lastName[0]}
                    </div>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${investor.firstName} ${investor.lastName}</h6>
                    <p class="text-muted small mb-1">${investor.company} • ${investor.investorType.toUpperCase()}</p>
                    <p class="small mb-2">${investor.bio.substring(0, 120)}...</p>
                    <div class="investor-stats mb-2">
                        <small class="text-success me-3">
                            <i class="fas fa-users me-1"></i>${investor.athletesFunded} athletes funded
                        </small>
                        <small class="text-primary">
                            <i class="fas fa-percentage me-1"></i>${investor.successRate}% success rate
                        </small>
                    </div>
                    <div class="investment-range mb-2">
                        <small class="text-info">
                            <i class="fas fa-dollar-sign me-1"></i>Investment: $${investor.minInvestment.toLocaleString()} - $${investor.maxInvestment.toLocaleString()}
                        </small>
                    </div>
                    <div class="sport-focus mb-2">
                        <small class="text-warning">
                            <i class="fas fa-trophy me-1"></i>Focus: ${investor.sportFocus.join(', ')}
                        </small>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-outline-primary btn-sm me-2" onclick="event.stopPropagation(); contactInvestor('${investor.id}')">
                            <i class="fas fa-envelope me-1"></i>Contact
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="event.stopPropagation(); viewInvestorDetails('${investor.id}')">
                            <i class="fas fa-eye me-1"></i>View Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    investorsContainer.innerHTML = investorsHtml;
    console.log('Investors loaded successfully!'); // Debug log
}

function loadRecentActivity(athleteId) {
    const activityContainer = document.getElementById('recentActivity');
    const investments = db.getInvestmentsByAthlete(athleteId);
    
    if (investments.length === 0) {
        activityContainer.innerHTML = '<p class="text-muted">No recent activity. Start promoting your profile to attract investors!</p>';
        return;
    }
    
    const activityHtml = investments.slice(0, 5).map(investment => {
        const date = new Date(investment.createdAt).toLocaleDateString();
        return `
            <div class="activity-item d-flex align-items-center mb-3">
                <div class="activity-icon me-3">
                    <i class="fas fa-dollar-sign text-success"></i>
                </div>
                <div>
                    <div class="fw-bold">New Investment</div>
                    <div class="text-muted">$${investment.amount.toLocaleString()} invested on ${date}</div>
                </div>
            </div>
        `;
    }).join('');
    
    activityContainer.innerHTML = activityHtml;
}

function loadRecentMessages(userId) {
    const messagesContainer = document.getElementById('recentMessages');
    const conversations = db.getConversations(userId);
    
    if (Object.keys(conversations).length === 0) {
        messagesContainer.innerHTML = '<p class="text-muted">No messages yet</p>';
        return;
    }
    
    const messagesHtml = Object.entries(conversations).slice(0, 3).map(([otherUserId, messages]) => {
        const lastMessage = messages[messages.length - 1];
        const otherUser = db.users.find(u => u.id === otherUserId);
        const userName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
        
        return `
            <div class="message-item d-flex align-items-center mb-3">
                <div class="message-avatar me-3">
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b5da19a7?w=40&h=40&fit=crop&crop=face" 
                         alt="${userName}" class="rounded-circle" style="width: 40px; height: 40px;">
                </div>
                <div>
                    <div class="fw-bold">${userName}</div>
                    <div class="text-muted small">${lastMessage.content.substring(0, 50)}...</div>
                </div>
            </div>
        `;
    }).join('');
    
    messagesContainer.innerHTML = messagesHtml;
}

// Investor dashboard
function initializeInvestorDashboard() {
    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.userType !== 'investor') {
        window.location.href = 'login.html';
        return;
    }
    
    loadAthletes();
    setupDashboardFilters();
    setupLoadMoreButton();
    updateDashboardStats();
}

function updateDashboardStats() {
    const athletes = db.getAllAthletes();
    document.getElementById('totalAthletes').textContent = athletes.length;
}

function loadAthletes() {
    const athletes = db.getAllAthletes();
    renderAthletes(athletes);
}

function renderAthletes(athletes) {
    const athletesList = document.getElementById('athletesList');
    if (!athletesList) return;
    
    athletesList.innerHTML = '';
    
    athletes.forEach(athlete => {
        const fundingProgress = athlete.fundingGoal > 0 ? (athlete.fundingRaised / athlete.fundingGoal) * 100 : 0;
        
        const athleteCard = document.createElement('div');
        athleteCard.className = 'col-lg-4 col-md-6 mb-4';
        athleteCard.innerHTML = `
            <div class="athlete-profile-card h-100">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${athlete.firstName[0]}${athlete.lastName[0]}
                    </div>
                    <div class="profile-info">
                        <h5 class="mb-1">${athlete.firstName} ${athlete.lastName}</h5>
                        <p class="mb-0 text-muted">${athlete.age} years old • ${athlete.location}</p>
                    </div>
                    ${athlete.verified ? '<i class="fas fa-check-circle text-success ms-auto"></i>' : ''}
                </div>
                
                <div class="profile-stats">
                    <span class="stat-badge">${athlete.sport}</span>
                    <span class="stat-badge">${formatNumber(athlete.socialFollowers)} followers</span>
                </div>
                
                <p class="mb-3">${athlete.bio}</p>
                
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <small class="text-muted">Funding Progress</small>
                        <small class="text-muted">$${athlete.fundingRaised.toLocaleString()} / $${athlete.fundingGoal.toLocaleString()}</small>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${fundingProgress}%"></div>
                    </div>
                </div>
                
                <div class="achievements mb-3">
                    <small class="text-muted d-block">Recent Achievement:</small>
                    <small>${athlete.achievements.split(',')[0]}...</small>
                </div>
                
                <div class="d-grid gap-2">
                    <button class="btn btn-primary btn-sm" onclick="showAthleteDetails('${athlete.id}')">
                        <i class="fas fa-eye me-2"></i>View Full Profile
                    </button>
                    <button class="btn btn-outline-primary btn-sm" onclick="contactAthlete('${athlete.id}')">
                        <i class="fas fa-envelope me-2"></i>Contact Athlete
                    </button>
                </div>
            </div>
        `;
        
        athletesList.appendChild(athleteCard);
    });
}

function setupDashboardFilters() {
    const searchInput = document.getElementById('searchInput');
    const sportFilter = document.getElementById('sportFilter');
    const ageFilter = document.getElementById('ageFilter');
    const fundingFilter = document.getElementById('fundingFilter');
    
    [searchInput, sportFilter, ageFilter, fundingFilter].forEach(element => {
        if (element) {
            element.addEventListener('input', applyFilters);
            element.addEventListener('change', applyFilters);
        }
    });
}

function applyFilters() {
    const query = document.getElementById('searchInput').value;
    const sport = document.getElementById('sportFilter').value;
    const ageRange = document.getElementById('ageFilter').value;
    const fundingRange = document.getElementById('fundingFilter').value;
    
    const filters = {};
    if (sport) filters.sport = sport;
    if (ageRange) filters.ageRange = ageRange;
    if (fundingRange) filters.fundingRange = fundingRange;
    
    const filteredAthletes = db.searchAthletes(query, filters);
    renderAthletes(filteredAthletes);
}

function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            showSuccessMessage('All available athletes are already displayed!');
        });
    }
}

// Messages
function initializeMessages() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    loadConversations(currentUser.id);
}

function loadConversations(userId) {
    const conversations = db.getConversations(userId);
    const conversationsList = document.getElementById('conversationsList');
    
    if (Object.keys(conversations).length === 0) {
        conversationsList.innerHTML = '<p class="text-muted">No conversations yet</p>';
        return;
    }
    
    const conversationsHtml = Object.entries(conversations).map(([otherUserId, messages]) => {
        const lastMessage = messages[messages.length - 1];
        const otherUser = db.users.find(u => u.id === otherUserId);
        const userName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
        
        return `
            <div class="conversation-item p-3 border-bottom cursor-pointer" onclick="loadConversation('${otherUserId}')">
                <div class="d-flex align-items-center">
                    <div class="conversation-avatar me-3">
                        <img src="https://images.unsplash.com/photo-1494790108755-2616b5da19a7?w=40&h=40&fit=crop&crop=face" 
                             alt="${userName}" class="rounded-circle" style="width: 40px; height: 40px;">
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-bold">${userName}</div>
                        <div class="text-muted small">${lastMessage.content.substring(0, 30)}...</div>
                    </div>
                    ${!lastMessage.read ? '<div class="badge bg-primary">New</div>' : ''}
                </div>
            </div>
        `;
    }).join('');
    
    conversationsList.innerHTML = conversationsHtml;
}

function loadConversation(otherUserId) {
    const currentUser = db.getCurrentUser();
    const conversations = db.getConversations(currentUser.id);
    const messages = conversations[otherUserId] || [];
    
    const chatMessages = document.getElementById('chatMessages');
    const chatHeader = document.getElementById('chatHeader');
    const chatInput = document.getElementById('chatInput');
    
    // Update header
    const otherUser = db.users.find(u => u.id === otherUserId);
    const userName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
    
    chatHeader.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="https://images.unsplash.com/photo-1494790108755-2616b5da19a7?w=40&h=40&fit=crop&crop=face" 
                 alt="${userName}" class="rounded-circle me-2" style="width: 40px; height: 40px;">
            <div>
                <h6 class="mb-0">${userName}</h6>
                <small class="text-muted">Online</small>
            </div>
        </div>
    `;
    
    // Load messages
    const messagesHtml = messages.map(message => {
        const isCurrentUser = message.senderId === currentUser.id;
        const messageClass = isCurrentUser ? 'message-sent' : 'message-received';
        
        return `
            <div class="message ${messageClass} mb-3">
                <div class="message-content">
                    ${message.content}
                </div>
                <div class="message-time">
                    ${new Date(message.timestamp).toLocaleTimeString()}
                </div>
            </div>
        `;
    }).join('');
    
    chatMessages.innerHTML = messagesHtml;
    chatInput.style.display = 'block';
    
    // Mark messages as read
    db.markMessagesAsRead(otherUserId, currentUser.id);
    
    // Store current conversation
    window.currentConversation = otherUserId;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !window.currentConversation) return;
    
    const currentUser = db.getCurrentUser();
    const messageData = {
        senderId: currentUser.id,
        receiverId: window.currentConversation,
        content: content
    };
    
    db.createMessage(messageData);
    messageInput.value = '';
    
    // Reload conversation
    loadConversation(window.currentConversation);
}

// Settings
function initializeSettings() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    setupSettingsTabs();
    loadUserSettings(currentUser);
}

function setupSettingsTabs() {
    const tabLinks = document.querySelectorAll('[data-tab]');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('d-none'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            document.getElementById(`${this.dataset.tab}-tab`).classList.remove('d-none');
        });
    });
}

function loadUserSettings(user) {
    // Load profile settings
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    
    if (firstName) firstName.value = user.firstName || '';
    if (lastName) lastName.value = user.lastName || '';
    if (email) email.value = user.email || '';
    
    if (user.userType === 'athlete') {
        const athlete = db.getAthleteByUserId(user.id);
        if (athlete) {
            const bio = document.getElementById('bio');
            if (bio) bio.value = athlete.bio || '';
        }
    }
}

// Athlete profile
function initializeAthleteProfile() {
    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.userType !== 'athlete') {
        // Load profile from URL parameter or current user
        loadAthleteProfileData();
        return;
    }
    
    const athlete = db.getAthleteByUserId(currentUser.id);
    if (athlete) {
        loadAthleteProfileData(athlete);
    }
}

function loadAthleteProfileData(athlete) {
    if (!athlete) {
        // Load sample data or redirect
        const sampleAthlete = db.getAllAthletes()[0];
        if (sampleAthlete) {
            athlete = sampleAthlete;
        } else {
            return;
        }
    }
    
    // Update profile information
    const elements = {
        'athleteName': `${athlete.firstName} ${athlete.lastName}`,
        'athleteAge': `${athlete.age} years old`,
        'athleteSport': athlete.sport,
        'athleteLocation': athlete.location,
        'athleteBio': athlete.bio
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Update stats
    const followers = document.getElementById('followers');
    const funding = document.getElementById('funding');
    const progress = document.getElementById('progress');
    
    if (followers) followers.textContent = formatNumber(athlete.socialFollowers);
    if (funding) funding.textContent = `$${formatNumber(athlete.fundingGoal)}`;
    
    const progressPercent = athlete.fundingGoal > 0 ? (athlete.fundingRaised / athlete.fundingGoal) * 100 : 0;
    if (progress) progress.textContent = `${Math.round(progressPercent)}%`;
    
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

// My investments
function initializeMyInvestments() {
    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.userType !== 'investor') {
        window.location.href = 'login.html';
        return;
    }
    
    const investor = db.getInvestorByUserId(currentUser.id);
    if (investor) {
        loadInvestmentData(investor);
    }
}

function loadInvestmentData(investor) {
    // Update stats
    document.getElementById('totalInvested').textContent = `$${investor.totalInvested.toLocaleString()}`;
    document.getElementById('totalReturn').textContent = `$${investor.totalReturns.toLocaleString()}`;
    document.getElementById('athleteCount').textContent = investor.athletesFunded;
    
    const successRate = investor.athletesFunded > 0 ? 
        Math.round((investor.totalReturns / investor.totalInvested) * 100) : 0;
    document.getElementById('successRate').textContent = `${successRate}%`;
    
    // Load investment table
    const investments = db.getInvestmentsByInvestor(investor.id);
    const tableBody = document.getElementById('investmentTable');
    
    if (investments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No investments yet</td></tr>';
        return;
    }
    
    const tableHtml = investments.map(investment => {
        const athlete = db.athletes.find(a => a.id === investment.athleteId);
        const athleteName = athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Unknown Athlete';
        const sport = athlete ? athlete.sport : 'Unknown';
        
        return `
            <tr>
                <td>${athleteName}</td>
                <td>${sport}</td>
                <td>$${investment.amount.toLocaleString()}</td>
                <td>${new Date(investment.createdAt).toLocaleDateString()}</td>
                <td>$${investment.currentValue || investment.amount.toLocaleString()}</td>
                <td><span class="badge bg-${investment.status === 'active' ? 'success' : 'warning'}">${investment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewInvestmentDetails('${investment.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableHtml;
}

// Utility functions
function showAthleteDetails(athleteId) {
    const athlete = db.athletes.find(a => a.id === athleteId);
    if (!athlete) return;
    
    // Store current athlete for modal actions
    currentModalAthlete = athlete;
    
    // Update athlete profile views
    athlete.profileViews += 1;
    db.updateAthlete(athleteId, { profileViews: athlete.profileViews });
    
    // Show modal
    const modal = document.getElementById('athleteModal');
    if (modal) {
        const modalBody = document.getElementById('athleteModalBody');
        const fundingProgress = athlete.fundingGoal > 0 ? (athlete.fundingRaised / athlete.fundingGoal) * 100 : 0;
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                    <div class="profile-avatar mx-auto mb-3" style="width: 100px; height: 100px; font-size: 2rem;">
                        ${athlete.firstName[0]}${athlete.lastName[0]}
                    </div>
                    <h4>${athlete.firstName} ${athlete.lastName}</h4>
                    <p class="text-muted">${athlete.age} years old • ${athlete.location}</p>
                    <div class="mb-3">
                        <span class="badge bg-primary me-2">${athlete.sport}</span>
                        ${athlete.verified ? '<span class="badge bg-success">Verified</span>' : ''}
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="mb-4">
                        <h6>About</h6>
                        <p>${athlete.bio}</p>
                    </div>
                    <div class="mb-4">
                        <h6>Achievements</h6>
                        <p>${athlete.achievements}</p>
                    </div>
                    <div class="mb-4">
                        <h6>Social Media</h6>
                        <p>${formatNumber(athlete.socialFollowers)} followers</p>
                        ${athlete.socialLinks ? `<a href="${athlete.socialLinks}" target="_blank" class="btn btn-outline-primary btn-sm">View Profile</a>` : ''}
                    </div>
                    <div class="mb-4">
                        <h6>Funding Information</h6>
                        <div class="row">
                            <div class="col-6">
                                <strong>Goal:</strong> $${athlete.fundingGoal.toLocaleString()}
                            </div>
                            <div class="col-6">
                                <strong>Raised:</strong> $${athlete.fundingRaised.toLocaleString()}
                            </div>
                        </div>
                        <div class="progress mt-2">
                            <div class="progress-bar" role="progressbar" style="width: ${fundingProgress}%"></div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <h6>Statistics</h6>
                        <div class="row">
                            <div class="col-4">
                                <strong>Profile Views:</strong><br>
                                <span class="text-primary">${athlete.profileViews}</span>
                            </div>
                            <div class="col-4">
                                <strong>Investors:</strong><br>
                                <span class="text-success">${athlete.investorCount}</span>
                            </div>
                            <div class="col-4">
                                <strong>Progress:</strong><br>
                                <span class="text-info">${Math.round(fundingProgress)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

function contactAthleteFromModal() {
    if (currentModalAthlete) {
        contactAthlete(currentModalAthlete.id);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('athleteModal'));
        if (modal) modal.hide();
    }
}

function investInAthleteFromModal() {
    if (currentModalAthlete) {
        investInAthlete(currentModalAthlete.id);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('athleteModal'));
        if (modal) modal.hide();
    }
}

function contactAthlete(athleteId) {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const athlete = db.athletes.find(a => a.id === athleteId);
    if (!athlete) return;
    
    const athleteUser = db.users.find(u => u.id === athlete.userId);
    if (!athleteUser) return;
    
    // Create initial message
    const messageData = {
        senderId: currentUser.id,
        receiverId: athleteUser.id,
        content: `Hi ${athlete.firstName}! I'm interested in learning more about your athletic journey and potential investment opportunities. I'd love to discuss how I can support your goals.`
    };
    
    db.createMessage(messageData);
    showSuccessMessage('Message sent successfully!');
    
    // Redirect to messages
    setTimeout(() => {
        window.location.href = 'messages.html';
    }, 1500);
}

function contactInvestor(investorId) {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const investor = db.investors.find(i => i.id === investorId);
    if (!investor) return;
    
    const investorUser = db.users.find(u => u.id === investor.userId);
    if (!investorUser) return;
    
    // Create initial message
    const messageData = {
        senderId: currentUser.id,
        receiverId: investorUser.id,
        content: `Hi ${investor.firstName}! I'm interested in connecting with you about potential investment opportunities. I believe my athletic profile aligns with your investment criteria. Would you like to discuss my funding goals?`
    };
    
    db.createMessage(messageData);
    showSuccessMessage('Message sent successfully!');
    
    // Redirect to messages
    setTimeout(() => {
        window.location.href = 'messages.html';
    }, 1500);
}

function viewInvestorDetails(investorId) {
    const investor = db.investors.find(i => i.id === investorId);
    if (!investor) return;
    
    // Store current investor for modal actions
    currentModalInvestor = investor;
    
    const detailsHtml = `
        <div class="row">
            <div class="col-md-4 text-center">
                <div class="profile-avatar mx-auto mb-3" style="width: 100px; height: 100px; font-size: 2rem;">
                    ${investor.firstName[0]}${investor.lastName[0]}
                </div>
                <h4>${investor.firstName} ${investor.lastName}</h4>
                <p class="text-muted">${investor.company}</p>
                <div class="mb-3">
                    <span class="badge bg-success me-2">${investor.investorType}</span>
                    ${investor.verified ? '<span class="badge bg-primary">Verified</span>' : ''}
                </div>
            </div>
            <div class="col-md-8">
                <div class="mb-4">
                    <h6>About</h6>
                    <p>${investor.bio}</p>
                </div>
                
                <div class="mb-4">
                    <h6>Investment Experience</h6>
                    <p>${investor.experience}</p>
                </div>
                
                <div class="row mb-4">
                    <div class="col-6">
                        <h6>Investment Statistics</h6>
                        <ul class="list-unstyled">
                            <li><strong>Athletes Funded:</strong> ${investor.athletesFunded}</li>
                            <li><strong>Success Rate:</strong> ${investor.successRate}%</li>
                            <li><strong>Total Invested:</strong> $${investor.totalInvested.toLocaleString()}</li>
                        </ul>
                    </div>
                    <div class="col-6">
                        <h6>Investment Preferences</h6>
                        <ul class="list-unstyled">
                            <li><strong>Min Investment:</strong> $${investor.minInvestment.toLocaleString()}</li>
                            <li><strong>Max Investment:</strong> $${investor.maxInvestment.toLocaleString()}</li>
                            <li><strong>Accreditation:</strong> ${investor.accreditation}</li>
                        </ul>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h6>Sports Focus</h6>
                    <div class="d-flex flex-wrap gap-2">
                        ${investor.sportFocus.map(sport => `<span class="badge bg-primary">${sport}</span>`).join('')}
                    </div>
                </div>
                
                <div class="mb-4">
                    <h6>Investment Criteria</h6>
                    <p>${investor.investmentCriteria}</p>
                </div>
                
                ${investor.portfolioHighlights ? `
                <div class="mb-4">
                    <h6>Portfolio Highlights</h6>
                    <ul>
                        ${investor.portfolioHighlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${investor.linkedIn ? `
                <div class="mb-3">
                    <a href="${investor.linkedIn}" target="_blank" class="btn btn-outline-primary btn-sm">
                        <i class="fab fa-linkedin me-2"></i>View LinkedIn Profile
                    </a>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Create modal
    const modalHtml = `
        <div class="modal fade" id="investorModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-tie me-2"></i>Investor Profile
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${detailsHtml}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="contactInvestorFromModal()">
                            <i class="fas fa-envelope me-2"></i>Contact Investor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal and add new one
    const existingModal = document.getElementById('investorModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('investorModal'));
    modal.show();
}

function contactInvestorFromModal() {
    if (currentModalInvestor) {
        contactInvestor(currentModalInvestor.id);
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('investorModal'));
        if (modal) modal.hide();
    }
}

function investInAthlete(athleteId) {
    const currentUser = db.getCurrentUser();
    if (!currentUser || currentUser.userType !== 'investor') {
        showErrorMessage('Only investors can make investments');
        return;
    }
    
    const athlete = db.athletes.find(a => a.id === athleteId);
    if (!athlete) return;
    
    // For now, simulate investment with a prompt
    const amount = prompt(`How much would you like to invest in ${athlete.firstName} ${athlete.lastName}?`, '25000');
    
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
        const investor = db.getInvestorByUserId(currentUser.id);
        if (investor) {
            const investmentData = {
                investorId: investor.id,
                athleteId: athleteId,
                amount: parseInt(amount),
                status: 'active'
            };
            
            db.createInvestment(investmentData);
            showSuccessMessage(`Successfully invested $${parseInt(amount).toLocaleString()} in ${athlete.firstName} ${athlete.lastName}!`);
        }
    }
}

function logout() {
    db.logout();
    showSuccessMessage('Logged out successfully!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function shareProfile() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;
    
    const shareUrl = `${window.location.origin}/athlete-profile.html?id=${currentUser.id}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Check out my athletic profile on ShootingStars',
            text: 'I\'m raising funds for my athletic journey. Check out my profile!',
            url: shareUrl
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showSuccessMessage('Profile link copied to clipboard!');
        });
    }
}

function updateStats() {
    showSuccessMessage('Stats updated successfully!');
}

function startNewConversation() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div class="modal fade" id="newConversationModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Start New Conversation</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Select User</label>
                            <select class="form-select" id="newConversationUser">
                                <option value="">Choose a user...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Message</label>
                            <textarea class="form-control" id="newConversationMessage" rows="3" placeholder="Type your message..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="createNewConversation()">Send Message</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load available users
    const currentUser = db.getCurrentUser();
    const otherUsers = db.users.filter(u => u.id !== currentUser.id);
    const userSelect = document.getElementById('newConversationUser');
    
    otherUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName} (${user.userType})`;
        userSelect.appendChild(option);
    });
    
    const bootstrapModal = new bootstrap.Modal(document.getElementById('newConversationModal'));
    bootstrapModal.show();
}

function createNewConversation() {
    const userId = document.getElementById('newConversationUser').value;
    const message = document.getElementById('newConversationMessage').value;
    
    if (!userId || !message) {
        showErrorMessage('Please select a user and enter a message');
        return;
    }
    
    const currentUser = db.getCurrentUser();
    const messageData = {
        senderId: currentUser.id,
        receiverId: userId,
        content: message
    };
    
    db.createMessage(messageData);
    
    // Close modal and refresh conversations
    const modal = bootstrap.Modal.getInstance(document.getElementById('newConversationModal'));
    modal.hide();
    
    showSuccessMessage('Message sent successfully!');
    
    // Refresh page
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        });
        
        // Custom password confirmation validation
        const password = form.querySelector('#password');
        const confirmPassword = form.querySelector('#confirmPassword');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                if (password.value !== confirmPassword.value) {
                    confirmPassword.setCustomValidity('Passwords do not match');
                } else {
                    confirmPassword.setCustomValidity('');
                }
            });
        }
    });
}

// Navigation
function initializeNavigation() {
    // Handle navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        }
    });
}

// Home page
function initializeHomePage() {
    initializeScrollAnimations();
    
    // Handle video play buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.play-button')) {
            e.preventDefault();
            // In a real app, this would open a video player
            showSuccessMessage('Video player would open here');
        }
    });
    
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
}

// Scroll animations
function initializeScrollAnimations() {
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
    
    // Observe elements that should animate
    document.querySelectorAll('.step-card, .trust-logo, .athlete-profile-card').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        ${message}
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showErrorMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Additional utility functions
function saveNotificationSettings() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;
    
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        investmentAlerts: document.getElementById('investmentAlerts').checked,
        messageNotifications: document.getElementById('messageNotifications').checked
    };
    
    // Save to user profile
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        db.users[userIndex].notificationSettings = settings;
        db.saveToStorage('users', db.users);
        showSuccessMessage('Notification settings saved successfully!');
    }
}

function savePrivacySettings() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;
    
    const settings = {
        publicProfile: document.getElementById('publicProfile').checked,
        showStats: document.getElementById('showStats').checked,
        allowMessages: document.getElementById('allowMessages').checked
    };
    
    // Save to user profile
    const userIndex = db.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        db.users[userIndex].privacySettings = settings;
        db.saveToStorage('users', db.users);
        showSuccessMessage('Privacy settings saved successfully!');
    }
}

function viewInvestmentDetails(investmentId) {
    const investment = db.investments.find(i => i.id === investmentId);
    if (!investment) return;
    
    const athlete = db.athletes.find(a => a.id === investment.athleteId);
    if (!athlete) return;
    
    showSuccessMessage(`Viewing details for investment in ${athlete.firstName} ${athlete.lastName}`);
}
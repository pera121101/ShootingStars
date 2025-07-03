class ShootingStarsDB {
    constructor() {
        this.users = this.getFromStorage('users') || [];
        this.athletes = this.getFromStorage('athletes') || [];
        this.investors = this.getFromStorage('investors') || [];
        this.investments = this.getFromStorage('investments') || [];
        this.messages = this.getFromStorage('messages') || [];
        this.currentUser = this.getFromStorage('currentUser') || null;
        this.initializeSampleData();
    }

    // Storage operations
    getFromStorage(key) {
        try {
            const data = localStorage.getItem(`shootingStars_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error reading ${key} from storage:`, error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(`shootingStars_${key}`, JSON.stringify(data));
            console.log(`Successfully saved ${key} to storage`);
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    }

    // User operations
    createUser(userData) {
        const userId = this.generateId();
        const user = {
            id: userId,
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        this.users.push(user);
        this.saveToStorage('users', this.users);
        
        // Create athlete or investor profile
        if (userData.userType === 'athlete') {
            this.createAthlete({...userData, userId});
        } else if (userData.userType === 'investor') {
            this.createInvestor({...userData, userId});
        }
        
        return user;
    }

    loginUser(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            user.lastLogin = new Date().toISOString();
            this.currentUser = user;
            this.saveToStorage('currentUser', this.currentUser);
            this.saveToStorage('users', this.users);
            return user;
        }
        return null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        this.saveToStorage('currentUser', null);
    }

    // Athlete operations
    createAthlete(athleteData) {
        const athlete = {
            id: this.generateId(),
            ...athleteData,
            profileViews: 0,
            fundingRaised: 0,
            investorCount: 0,
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        this.athletes.push(athlete);
        this.saveToStorage('athletes', this.athletes);
        return athlete;
    }

    getAthleteByUserId(userId) {
        return this.athletes.find(a => a.userId === userId);
    }

    updateAthlete(athleteId, updates) {
        const index = this.athletes.findIndex(a => a.id === athleteId);
        if (index !== -1) {
            this.athletes[index] = { ...this.athletes[index], ...updates };
            this.saveToStorage('athletes', this.athletes);
            return this.athletes[index];
        }
        return null;
    }

    getAllAthletes() {
        return this.athletes;
    }

    // Investor operations
    createInvestor(investorData) {
        const investor = {
            id: this.generateId(),
            ...investorData,
            totalInvested: 0,
            totalReturns: 0,
            athletesFunded: 0,
            verified: false,
            createdAt: new Date().toISOString()
        };
        
        this.investors.push(investor);
        this.saveToStorage('investors', this.investors);
        return investor;
    }

    getInvestorByUserId(userId) {
        return this.investors.find(i => i.userId === userId);
    }

    updateInvestor(investorId, updates) {
        const index = this.investors.findIndex(i => i.id === investorId);
        if (index !== -1) {
            this.investors[index] = { ...this.investors[index], ...updates };
            this.saveToStorage('investors', this.investors);
            return this.investors[index];
        }
        return null;
    }

    // Investment operations
    createInvestment(investmentData) {
        const investment = {
            id: this.generateId(),
            ...investmentData,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        this.investments.push(investment);
        this.saveToStorage('investments', this.investments);
        
        // Update athlete and investor stats
        this.updateAthleteStats(investment.athleteId, investment.amount);
        this.updateInvestorStats(investment.investorId, investment.amount);
        
        return investment;
    }

    getInvestmentsByInvestor(investorId) {
        return this.investments.filter(i => i.investorId === investorId);
    }

    getInvestmentsByAthlete(athleteId) {
        return this.investments.filter(i => i.athleteId === athleteId);
    }

    updateAthleteStats(athleteId, amount) {
        const athlete = this.athletes.find(a => a.id === athleteId);
        if (athlete) {
            athlete.fundingRaised += amount;
            athlete.investorCount += 1;
            this.saveToStorage('athletes', this.athletes);
        }
    }

    updateInvestorStats(investorId, amount) {
        const investor = this.investors.find(i => i.id === investorId);
        if (investor) {
            investor.totalInvested += amount;
            investor.athletesFunded += 1;
            this.saveToStorage('investors', this.investors);
        }
    }

    // Message operations
    createMessage(messageData) {
        const message = {
            id: this.generateId(),
            ...messageData,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        this.messages.push(message);
        this.saveToStorage('messages', this.messages);
        return message;
    }

    getMessagesByUser(userId) {
        return this.messages.filter(m => m.senderId === userId || m.receiverId === userId);
    }

    getConversations(userId) {
        const userMessages = this.getMessagesByUser(userId);
        const conversations = {};
        
        userMessages.forEach(message => {
            const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
            if (!conversations[otherUserId]) {
                conversations[otherUserId] = [];
            }
            conversations[otherUserId].push(message);
        });
        
        return conversations;
    }

    markMessagesAsRead(conversationId, userId) {
        this.messages.forEach(message => {
            if ((message.senderId === conversationId && message.receiverId === userId) ||
                (message.senderId === userId && message.receiverId === conversationId)) {
                message.read = true;
            }
        });
        this.saveToStorage('messages', this.messages);
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    initializeSampleData() {
        if (this.athletes.length === 0) {
            // Create sample athletes
            const sampleAthletes = [
                {
                    id: 'athlete_1',
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john.smith@email.com',
                    sport: 'football',
                    age: 16,
                    location: 'Dallas, TX',
                    bio: 'Started playing football at 10, led team to state finals.',
                    achievements: 'State Championship Finalist, Team MVP, 3,247 passing yards',
                    fundingGoal: 25000,
                    fundingRaised: 15000,
                    socialFollowers: 5200,
                    socialLinks: 'https://twitter.com/johnsmith_qb',
                    videoHighlights: 'https://youtube.com/watch?v=sample',
                    profileViews: 847,
                    investorCount: 3,
                    verified: true,
                    createdAt: '2024-01-15T10:30:00Z'
                },
                {
                    id: 'athlete_2',
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    email: 'sarah.johnson@email.com',
                    sport: 'baseball',
                    age: 17,
                    location: 'Miami, FL',
                    bio: 'Pitcher with a 0.90 ERA, dreams of playing in the majors.',
                    achievements: 'All-State First Team, Regional MVP, 0.90 ERA',
                    fundingGoal: 30000,
                    fundingRaised: 18000,
                    socialFollowers: 3800,
                    socialLinks: 'https://instagram.com/sarahj_baseball',
                    videoHighlights: 'https://youtube.com/watch?v=sample2',
                    profileViews: 623,
                    investorCount: 2,
                    verified: true,
                    createdAt: '2024-01-20T14:15:00Z'
                },
                {
                    id: 'athlete_3',
                    firstName: 'Mike',
                    lastName: 'Chen',
                    email: 'mike.chen@email.com',
                    sport: 'martial_arts',
                    age: 18,
                    location: 'Los Angeles, CA',
                    bio: 'Martial arts prodigy training for Olympic trials.',
                    achievements: 'Black Belt, National Champion, 24 wins',
                    fundingGoal: 20000,
                    fundingRaised: 12000,
                    socialFollowers: 2500,
                    socialLinks: 'https://twitter.com/mikechen_mma',
                    videoHighlights: 'https://youtube.com/watch?v=sample3',
                    profileViews: 412,
                    investorCount: 1,
                    verified: true,
                    createdAt: '2024-02-01T09:45:00Z'
                }
            ];

            this.athletes = sampleAthletes;
            this.saveToStorage('athletes', this.athletes);
        }

        if (this.messages.length === 0) {
            // Create sample messages
            const sampleMessages = [
                {
                    id: 'msg_1',
                    senderId: 'investor_1',
                    receiverId: 'athlete_1',
                    content: 'Hi John! I\'m interested in your football career. Would love to discuss potential investment opportunities.',
                    timestamp: '2024-03-01T10:30:00Z',
                    read: false
                },
                {
                    id: 'msg_2',
                    senderId: 'athlete_1',
                    receiverId: 'investor_1',
                    content: 'Thank you for reaching out! I\'d be happy to discuss my goals and how your investment could help.',
                    timestamp: '2024-03-01T11:15:00Z',
                    read: true
                }
            ];

            this.messages = sampleMessages;
            this.saveToStorage('messages', this.messages);
        }
    }

    // Search and filter functions
    searchAthletes(query, filters = {}) {
        let results = this.athletes;

        // Text search
        if (query) {
            results = results.filter(athlete => 
                athlete.firstName.toLowerCase().includes(query.toLowerCase()) ||
                athlete.lastName.toLowerCase().includes(query.toLowerCase()) ||
                athlete.sport.toLowerCase().includes(query.toLowerCase()) ||
                athlete.location.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Apply filters
        if (filters.sport) {
            results = results.filter(athlete => athlete.sport === filters.sport);
        }

        if (filters.ageRange) {
            const [minAge, maxAge] = filters.ageRange.split('-').map(Number);
            results = results.filter(athlete => 
                athlete.age >= minAge && athlete.age <= maxAge
            );
        }

        if (filters.fundingRange) {
            const [minFunding, maxFunding] = filters.fundingRange.split('-').map(Number);
            results = results.filter(athlete => 
                athlete.fundingGoal >= minFunding && 
                (maxFunding ? athlete.fundingGoal <= maxFunding : true)
            );
        }

        return results;
    }

    // Clear all data (for testing)
    clearAllData() {
        this.users = [];
        this.athletes = [];
        this.investors = [];
        this.investments = [];
        this.messages = [];
        this.currentUser = null;
        
        localStorage.removeItem('shootingStars_users');
        localStorage.removeItem('shootingStars_athletes');
        localStorage.removeItem('shootingStars_investors');
        localStorage.removeItem('shootingStars_investments');
        localStorage.removeItem('shootingStars_messages');
        localStorage.removeItem('shootingStars_currentUser');
    }
}

// Initialize database
const db = new ShootingStarsDB();

// Export for use in other files
window.db = db;

// Debug function to check localStorage
window.debugStorage = function() {
    console.log('LocalStorage contents:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('shootingStars_')) {
            console.log(key, JSON.parse(localStorage.getItem(key)));
        }
    }
};
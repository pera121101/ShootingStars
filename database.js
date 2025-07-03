class ShootingStarsDB {
    constructor() {
        this.isInitialized = false;
        this.users = [];
        this.athletes = [];
        this.investors = [];
        this.investments = [];
        this.messages = [];
        this.currentUser = null;
        
        this.initializeDatabase();
    }

    initializeDatabase() {
        try {
            // Load existing data
            this.users = this.getFromStorage('users') || [];
            this.athletes = this.getFromStorage('athletes') || [];
            this.investors = this.getFromStorage('investors') || [];
            this.investments = this.getFromStorage('investments') || [];
            this.messages = this.getFromStorage('messages') || [];
            this.currentUser = this.getFromStorage('currentUser') || null;
            
            // Only ensure sample data if arrays are empty
            this.ensureInitialSampleData();
            this.isInitialized = true;
            
            console.log('Database initialized successfully');
            console.log('Athletes:', this.athletes.length);
            console.log('Investors:', this.investors.length);
            console.log('Users:', this.users.length);
            
        } catch (error) {
            console.error('Error initializing database:', error);
            this.forceReset();
        }
    }

    forceReset() {
        console.log('Forcing database reset...');
        this.clearAllData();
        this.createAllSampleData();
        this.isInitialized = true;
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
            console.log(`Saved ${key} with ${data.length} items`);
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
        }
    }

    // Only ensure sample data if database is empty (initial load)
    ensureInitialSampleData() {
        console.log('Ensuring initial sample data...');
        
        // Only add sample data if arrays are completely empty
        if (this.users.length === 0) {
            this.addSampleUsers();
        }
        
        if (this.athletes.length === 0) {
            this.addSampleAthletes();
        }
        
        if (this.investors.length === 0) {
            this.addSampleInvestors();
        }
        
        if (this.messages.length === 0) {
            this.addSampleMessages();
        }
        
        console.log('Initial sample data ensured - Investors:', this.investors.length);
    }

    // Create all sample data (used only for reset)
    createAllSampleData() {
        this.addSampleUsers();
        this.addSampleAthletes();
        this.addSampleInvestors();
        this.addSampleMessages();
    }

    // User operations
    createUser(userData) {
        console.log('Creating user:', userData.userType);
        
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
        console.log('Creating athlete profile');
        
        const athlete = {
            id: this.generateId(),
            ...athleteData,
            profileViews: Math.floor(Math.random() * 1000),
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
        return this.athletes || [];
    }

    getAllInvestors() {
        console.log('Getting all investors, count:', this.investors.length);
        return this.investors || [];
    }

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ ИНВЕСТОРА
    createInvestor(investorData) {
        console.log('Creating investor profile');
        console.log('Current investors before creation:', this.investors.length);
        
        // Убедимся, что мы загружаем актуальные данные из localStorage
        const existingInvestors = this.getFromStorage('investors') || [];
        this.investors = [...existingInvestors]; // Обновляем локальный массив
        
        const investor = {
            id: this.generateId(),
            ...investorData,
            totalInvested: Math.floor(Math.random() * 500000),
            totalReturns: Math.floor(Math.random() * 200000),
            athletesFunded: Math.floor(Math.random() * 10),
            verified: false,
            successRate: Math.floor(Math.random() * 40) + 60, // 60-100%
            avgDealSize: Math.floor(Math.random() * 50000) + 25000, // 25k-75k
            portfolioHighlights: ['New investor profile', 'Building portfolio'],
            createdAt: new Date().toISOString()
        };
        
        this.investors.push(investor);
        console.log('Current investors after adding new one:', this.investors.length);
        
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

    // Sample data creation methods - SAFE versions that don't overwrite
    addSampleUsers() {
        console.log('Adding sample users...');
        const currentCount = this.users.length;
        
        const sampleUsers = [
            // Athlete users
            { id: 'user_athlete_1', firstName: 'Lamine', lastName: 'Yamal', email: 'lamine.yamal@email.com', password: 'password123', userType: 'athlete', createdAt: '2024-01-10T08:30:00Z' },
            { id: 'user_athlete_2', firstName: 'Cavan', lastName: 'Sullivan', email: 'cavan.sullivan@email.com', password: 'password123', userType: 'athlete', createdAt: '2024-01-15T14:20:00Z' },
            { id: 'user_athlete_3', firstName: 'Hailey', lastName: 'Van Lith', email: 'hailey.vanlith@email.com', password: 'password123', userType: 'athlete', createdAt: '2024-01-18T11:45:00Z' },
            { id: 'user_athlete_4', firstName: 'Dylan', lastName: 'Crews', email: 'dylan.crews@email.com', password: 'password123', userType: 'athlete', createdAt: '2024-01-22T16:15:00Z' },
            { id: 'user_athlete_5', firstName: 'Kenji', lastName: 'Nakamura', email: 'kenji.nakamura@email.com', password: 'password123', userType: 'athlete', createdAt: '2024-01-25T09:30:00Z' },
            // Investor users
            { id: 'user_investor_1', firstName: 'Marcus', lastName: 'Thompson', email: 'marcus.thompson@athleticventures.com', password: 'password123', userType: 'investor', createdAt: '2023-06-15T10:30:00Z' },
            { id: 'user_investor_2', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@chensports.com', password: 'password123', userType: 'investor', createdAt: '2023-08-20T14:15:00Z' },
            { id: 'user_investor_3', firstName: 'David', lastName: 'Rodriguez', email: 'david@championfund.com', password: 'password123', userType: 'investor', createdAt: '2023-05-10T09:15:00Z' },
            { id: 'user_investor_4', firstName: 'Jennifer', lastName: 'Kim', email: 'jennifer@nextsportsventures.com', password: 'password123', userType: 'investor', createdAt: '2023-07-22T11:45:00Z' },
            { id: 'user_investor_5', firstName: 'Michael', lastName: 'Johnson', email: 'michael@speedcapital.com', password: 'password123', userType: 'investor', createdAt: '2023-09-05T16:30:00Z' },
            { id: 'user_investor_6', firstName: 'Emma', lastName: 'Williams', email: 'emma@futurestarsfund.com', password: 'password123', userType: 'investor', createdAt: '2023-04-18T13:20:00Z' },
            { id: 'user_investor_7', firstName: 'Robert', lastName: 'Davis', email: 'robert@championsinvestments.com', password: 'password123', userType: 'investor', createdAt: '2023-11-12T10:45:00Z' }
        ];

        let added = 0;
        sampleUsers.forEach(sampleUser => {
            const exists = this.users.find(u => u.id === sampleUser.id || u.email === sampleUser.email);
            if (!exists) {
                this.users.push(sampleUser);
                added++;
            }
        });

        if (added > 0) {
            this.saveToStorage('users', this.users);
            console.log(`Added ${added} sample users (total: ${this.users.length})`);
        }
    }

    addSampleAthletes() {
        console.log('Adding sample athletes...');
        
        const sampleAthletes = [
            {
                id: 'athlete_1', userId: 'user_athlete_1', firstName: 'Lamine', lastName: 'Yamal', email: 'lamine.yamal@email.com', sport: 'soccer', age: 16, location: 'Barcelona, Spain',
                bio: 'Youngest player to ever score for FC Barcelona. Started at La Masia academy at age 7. Known for exceptional dribbling skills and vision on the field.',
                achievements: 'Youngest scorer in El Clasico history, La Liga debut at 15, Spanish national team call-up, Champions League appearances',
                fundingGoal: 75000, fundingRaised: 45000, socialFollowers: 2500000, socialLinks: 'https://instagram.com/lamineyamal',
                videoHighlights: 'https://youtube.com/watch?v=lamine_highlights', profileViews: 15847, investorCount: 8, verified: true, createdAt: '2024-01-10T08:30:00Z'
            },
            {
                id: 'athlete_2', userId: 'user_athlete_2', firstName: 'Cavan', lastName: 'Sullivan', email: 'cavan.sullivan@email.com', sport: 'soccer', age: 14, location: 'Philadelphia, PA',
                bio: 'Youngest player to debut in MLS history with Philadelphia Union. Exceptional midfielder with incredible ball control and tactical awareness.',
                achievements: 'Youngest MLS debutant ever, US Youth National Team captain, Generation Adidas player',
                fundingGoal: 50000, fundingRaised: 32000, socialFollowers: 180000, socialLinks: 'https://instagram.com/cavansullivan',
                videoHighlights: 'https://youtube.com/watch?v=cavan_highlights', profileViews: 8234, investorCount: 5, verified: true, createdAt: '2024-01-15T14:20:00Z'
            },
            {
                id: 'athlete_3', userId: 'user_athlete_3', firstName: 'Hailey', lastName: 'Van Lith', email: 'hailey.vanlith@email.com', sport: 'basketball', age: 20, location: 'Louisville, KY',
                bio: 'Elite guard transferring to LSU. Known for clutch shooting and leadership. Olympic training camp participant with pro aspirations.',
                achievements: 'ACC Tournament MVP, 20+ PPG scorer, Olympic training camp invite, NCAA Tournament Elite Eight',
                fundingGoal: 60000, fundingRaised: 41000, socialFollowers: 450000, socialLinks: 'https://instagram.com/haileyvanlith',
                videoHighlights: 'https://youtube.com/watch?v=hailey_highlights', profileViews: 12567, investorCount: 7, verified: true, createdAt: '2024-01-18T11:45:00Z'
            },
            {
                id: 'athlete_4', userId: 'user_athlete_4', firstName: 'Dylan', lastName: 'Crews', email: 'dylan.crews@email.com', sport: 'baseball', age: 21, location: 'Baton Rouge, LA',
                bio: 'LSU baseball superstar and top MLB draft prospect. Exceptional hitter with power and speed. Team captain and leader.',
                achievements: 'SEC Player of the Year, .380+ batting average, 25+ home runs, Golden Spikes Award finalist',
                fundingGoal: 85000, fundingRaised: 62000, socialFollowers: 220000, socialLinks: 'https://instagram.com/dylancrews',
                videoHighlights: 'https://youtube.com/watch?v=dylan_highlights', profileViews: 9876, investorCount: 9, verified: true, createdAt: '2024-01-22T16:15:00Z'
            },
            {
                id: 'athlete_5', userId: 'user_athlete_5', firstName: 'Kenji', lastName: 'Nakamura', email: 'kenji.nakamura@email.com', sport: 'martial_arts', age: 17, location: 'Los Angeles, CA',
                bio: 'Rising karate and MMA prodigy. Multiple-time national champion training for Olympic trials. Undefeated in amateur MMA.',
                achievements: 'National Karate Champion (3x), Amateur MMA record 12-0, Olympic trials qualifier, Black belt 3rd Dan',
                fundingGoal: 40000, fundingRaised: 28000, socialFollowers: 95000, socialLinks: 'https://instagram.com/kenjinakamura_mma',
                videoHighlights: 'https://youtube.com/watch?v=kenji_highlights', profileViews: 5432, investorCount: 4, verified: true, createdAt: '2024-01-25T09:30:00Z'
            }
        ];

        let added = 0;
        sampleAthletes.forEach(sampleAthlete => {
            const exists = this.athletes.find(a => a.id === sampleAthlete.id || a.email === sampleAthlete.email);
            if (!exists) {
                this.athletes.push(sampleAthlete);
                added++;
            }
        });

        if (added > 0) {
            this.saveToStorage('athletes', this.athletes);
            console.log(`Added ${added} sample athletes (total: ${this.athletes.length})`);
        }
    }

    addSampleInvestors() {
        console.log('Adding sample investors...');
        console.log('Current investors before adding samples:', this.investors.length);
        
        const sampleInvestors = [
            {
                id: 'investor_1', userId: 'user_investor_1', firstName: 'Marcus', lastName: 'Thompson', email: 'marcus.thompson@athleticventures.com',
                company: 'Athletic Ventures', investorType: 'vc', accreditation: 'accredited',
                bio: 'Former NBA player turned venture capitalist. Specializes in early-stage sports technology and athlete development investments.',
                totalInvested: 2500000, totalReturns: 3200000, athletesFunded: 47, minInvestment: 25000, maxInvestment: 500000,
                sportFocus: ['basketball', 'football', 'baseball'], investmentCriteria: 'Looking for athletes aged 15-22 with strong social media presence and clear path to professional sports',
                experience: '15 years investing in sports. Former NBA player with deep industry connections. Portfolio includes 3 current NBA players.',
                linkedIn: 'https://linkedin.com/in/marcusthompson', verified: true, successRate: 85, avgDealSize: 75000,
                portfolioHighlights: ['Helped fund 3 current NBA players', 'Invested in Olympic gold medalist', 'Portfolio combined earnings: $50M+'], createdAt: '2023-06-15T10:30:00Z'
            },
            {
                id: 'investor_2', userId: 'user_investor_2', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@chensports.com',
                company: 'Chen Sports Capital', investorType: 'angel', accreditation: 'accredited',
                bio: 'Serial entrepreneur who built and sold sports marketing company for $50M. Now focuses on funding young athletes with high potential.',
                totalInvested: 1800000, totalReturns: 2700000, athletesFunded: 32, minInvestment: 15000, maxInvestment: 250000,
                sportFocus: ['soccer', 'tennis', 'martial_arts'], investmentCriteria: 'Passionate about funding female athletes and international talents. Focus on athletes with strong work ethic and coachability.',
                experience: 'Founded SportsConnect (sold for $50M). 8 years angel investing. Mentored 50+ young entrepreneurs and athletes.',
                linkedIn: 'https://linkedin.com/in/sarahchen', verified: true, successRate: 78, avgDealSize: 45000,
                portfolioHighlights: ['Funded 2 Olympic athletes', 'Invested in World Cup qualifier', '90% of portfolio still competing professionally'], createdAt: '2023-08-20T14:15:00Z'
            },
            {
                id: 'investor_3', userId: 'user_investor_3', firstName: 'David', lastName: 'Rodriguez', email: 'david@championfund.com',
                company: 'Champion Fund', investorType: 'family_office', accreditation: 'accredited',
                bio: 'Family office managing $500M in assets. Dedicated $50M specifically for young athlete investments. Former college football coach.',
                totalInvested: 3200000, totalReturns: 4100000, athletesFunded: 28, minInvestment: 50000, maxInvestment: 1000000,
                sportFocus: ['football', 'baseball', 'basketball'], investmentCriteria: 'Seeking elite performers with college scholarship potential or professional prospects. Strong academic performance preferred.',
                experience: 'Former Division I football coach. 12 years in athlete development. Managed $500M family office portfolio.',
                linkedIn: 'https://linkedin.com/in/davidrodriguez', verified: true, successRate: 92, avgDealSize: 125000,
                portfolioHighlights: ['Funded 2 NFL draft picks', 'Invested in 5 Division I scholarship athletes', 'Zero portfolio defaults'], createdAt: '2023-05-10T09:15:00Z'
            },
            {
                id: 'investor_4', userId: 'user_investor_4', firstName: 'Jennifer', lastName: 'Kim', email: 'jennifer@nextsportsventures.com',
                company: 'Next Sports Ventures', investorType: 'vc', accreditation: 'qualified',
                bio: 'Managing Partner at sports-focused VC fund. Former Olympic swimmer and Stanford MBA. Passionate about supporting young female athletes.',
                totalInvested: 4500000, totalReturns: 6200000, athletesFunded: 65, minInvestment: 20000, maxInvestment: 750000,
                sportFocus: ['swimming', 'tennis', 'basketball', 'soccer'], investmentCriteria: 'Focus on female athletes and underrepresented sports. Looking for athletes with strong mental toughness and leadership qualities.',
                experience: 'Olympic swimmer (2 medals). 10 years VC experience. Led investments in 3 sports startups that went public.',
                linkedIn: 'https://linkedin.com/in/jenniferkim', verified: true, successRate: 88, avgDealSize: 85000,
                portfolioHighlights: ['Funded 4 Olympic athletes', 'Invested in WNBA draft pick', 'Portfolio includes Tennis Grand Slam winner'], createdAt: '2023-07-22T11:45:00Z'
            },
            {
                id: 'investor_5', userId: 'user_investor_5', firstName: 'Michael', lastName: 'Johnson', email: 'michael@speedcapital.com',
                company: 'Speed Capital', investorType: 'angel', accreditation: 'accredited',
                bio: 'Former Olympic sprinter and sports marketing executive. Specializes in track & field and combat sports investments.',
                totalInvested: 1200000, totalReturns: 1650000, athletesFunded: 22, minInvestment: 10000, maxInvestment: 200000,
                sportFocus: ['martial_arts', 'track_field', 'boxing'], investmentCriteria: 'Individual sports athletes with Olympic potential. Strong preference for combat sports and track & field.',
                experience: 'Olympic gold medalist. 15 years sports marketing. Built athlete endorsement deals worth $100M+.',
                linkedIn: 'https://linkedin.com/in/michaeljohnson', verified: true, successRate: 82, avgDealSize: 55000,
                portfolioHighlights: ['Funded Olympic qualifier', 'Invested in UFC prospect', 'Portfolio includes World Championship medalist'], createdAt: '2023-09-05T16:30:00Z'
            },
            {
                id: 'investor_6', userId: 'user_investor_6', firstName: 'Emma', lastName: 'Williams', email: 'emma@futurestarsfund.com',
                company: 'Future Stars Fund', investorType: 'private_equity', accreditation: 'qualified',
                bio: 'Private equity professional specializing in sports investments. Former D1 soccer player with deep understanding of athlete development.',
                totalInvested: 2800000, totalReturns: 3600000, athletesFunded: 38, minInvestment: 30000, maxInvestment: 400000,
                sportFocus: ['soccer', 'basketball', 'tennis'], investmentCriteria: 'Team sport athletes with leadership potential. Strong academic performance and community involvement preferred.',
                experience: 'Former D1 soccer player. 8 years private equity. Managed sports investments portfolio worth $200M.',
                linkedIn: 'https://linkedin.com/in/emmawilliams', verified: true, successRate: 79, avgDealSize: 75000,
                portfolioHighlights: ['Funded MLS draft pick', 'Invested in NCAA Champion', 'Portfolio includes professional soccer players'], createdAt: '2023-04-18T13:20:00Z'
            },
            {
                id: 'investor_7', userId: 'user_investor_7', firstName: 'Robert', lastName: 'Davis', email: 'robert@championsinvestments.com',
                company: 'Champions Investments', investorType: 'individual', accreditation: 'accredited',
                bio: 'High net worth individual and former MLB player. Passionate about helping young baseball and football players achieve their dreams.',
                totalInvested: 950000, totalReturns: 1200000, athletesFunded: 15, minInvestment: 25000, maxInvestment: 150000,
                sportFocus: ['baseball', 'football'], investmentCriteria: 'Baseball and football players with professional potential. Strong character and family support system essential.',
                experience: 'Former MLB player (8 seasons). Real estate investor. Youth sports coach for 10 years.',
                linkedIn: 'https://linkedin.com/in/robertdavis', verified: true, successRate: 87, avgDealSize: 63000,
                portfolioHighlights: ['Funded minor league prospect', 'Invested in college scholarship athlete', 'Portfolio includes Division I players'], createdAt: '2023-11-12T10:45:00Z'
            }
        ];

        let added = 0;
        sampleInvestors.forEach(sampleInvestor => {
            const exists = this.investors.find(i => i.id === sampleInvestor.id || i.email === sampleInvestor.email);
            if (!exists) {
                this.investors.push(sampleInvestor);
                added++;
                console.log(`Added investor: ${sampleInvestor.firstName} ${sampleInvestor.lastName}`);
            }
        });

        if (added > 0) {
            this.saveToStorage('investors', this.investors);
            console.log(`Added ${added} sample investors. Total investors now: ${this.investors.length}`);
        } else {
            console.log(`No sample investors added - all already exist. Total: ${this.investors.length}`);
        }
    }

    addSampleMessages() {
        const sampleMessages = [
            {
                id: 'msg_1', senderId: 'user_investor_1', receiverId: 'user_athlete_1',
                content: 'Hi Lamine! I\'m Marcus from Athletic Ventures. Your performance with Barcelona has been incredible. I\'d love to discuss potential investment opportunities to support your development.',
                timestamp: '2024-03-01T10:30:00Z', read: false
            },
            {
                id: 'msg_2', senderId: 'user_athlete_1', receiverId: 'user_investor_1',
                content: 'Thank you Marcus! I\'d be very interested in discussing how investment could help accelerate my career development and training opportunities.',
                timestamp: '2024-03-01T11:15:00Z', read: true
            }
        ];

        let added = 0;
        sampleMessages.forEach(sampleMessage => {
            const exists = this.messages.find(m => m.id === sampleMessage.id);
            if (!exists) {
                this.messages.push(sampleMessage);
                added++;
            }
        });

        if (added > 0) {
            this.saveToStorage('messages', this.messages);
            console.log(`Added ${added} sample messages`);
        }
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Search and filter functions
    searchAthletes(query, filters = {}) {
        let results = this.athletes || [];

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

    // Force refresh sample data
    refreshSampleData() {
        this.clearAllData();
        this.createAllSampleData();
        console.log('Sample data refreshed!');
    }
}

// Initialize database
const db = new ShootingStarsDB();

// Export for use in other files
window.db = db;

// Debug functions
window.debugStorage = function() {
    console.log('=== LocalStorage Debug ===');
    console.log('Users:', db.users.length);
    console.log('Athletes:', db.athletes.length);
    console.log('Investors:', db.investors.length);
    console.log('Current investors:', db.getAllInvestors());
    console.log('Investor IDs:', db.investors.map(i => i.id));
    console.log('User IDs:', db.users.map(u => u.id));
};

window.refreshData = function() {
    db.refreshSampleData();
    window.location.reload();
};

window.checkInvestors = function() {
    console.log('=== Investors Check ===');
    console.log('Current investors:', db.getAllInvestors().length);
    console.log('Sample investors exist:', db.investors.some(i => i.id.startsWith('investor_')));
    console.log('All investor IDs:', db.investors.map(i => i.id));
    console.log('All investor names:', db.investors.map(i => `${i.firstName} ${i.lastName}`));
};

window.forceReset = function() {
    localStorage.clear();
    window.location.reload();
};

window.fixInvestors = function() {
    console.log('=== Fixing Investors ===');
    console.log('Before fix - investors:', db.investors.length);
    
    // Only add missing sample investors
    const sampleInvestorIds = ['investor_1', 'investor_2', 'investor_3', 'investor_4', 'investor_5', 'investor_6', 'investor_7'];
    const missingInvestors = sampleInvestorIds.filter(id => !db.investors.find(i => i.id === id));
    
    if (missingInvestors.length > 0) {
        console.log('Missing investors:', missingInvestors);
        db.addSampleInvestors();
    }
    
    console.log('After fix - investors:', db.investors.length);
    window.location.reload();
};
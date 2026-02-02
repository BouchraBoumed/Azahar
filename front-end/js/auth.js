const auth = {
    currentUser: null,
    
    init() {
        this.loadUser();
        this.updateUI();
    },
    
    loadUser() {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
        }
    },
    
    saveUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    },
    
    register(userData) {
        const users = this.getUsers();
        
        if (users.find(u => u.email === userData.email)) {
            throw new Error('Email already registered');
        }
        
        const newUser = {
            id: Date.now().toString(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: this.hashPassword(userData.password),
            points: 0,
            appointments: [],
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.currentUser = { ...newUser };
        delete this.currentUser.password;
        this.saveUser();
        
        return this.currentUser;
    },
    
    login(email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Invalid email or password');
        }
        
        this.currentUser = { ...user };
        delete this.currentUser.password;
        this.saveUser();
        
        return this.currentUser;
    },
    
    logout() {
        this.currentUser = null;
        this.saveUser();
        this.updateUI();
        window.location.href = 'index.html';
    },
    
    updateProfile(updates) {
        if (!this.currentUser) {
            throw new Error('Not logged in');
        }
        
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem('users', JSON.stringify(users));
        
        this.currentUser = { ...users[userIndex] };
        delete this.currentUser.password;
        this.saveUser();
        
        return this.currentUser;
    },
    
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('Not logged in');
        }
        
        const users = this.getUsers();
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (!user || user.password !== this.hashPassword(currentPassword)) {
            throw new Error('Current password is incorrect');
        }
        
        user.password = this.hashPassword(newPassword);
        localStorage.setItem('users', JSON.stringify(users));
        
        return true;
    },
    
    addPoints(points) {
        if (!this.currentUser) return;
        
        const users = this.getUsers();
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (user) {
            user.points = (user.points || 0) + points;
            localStorage.setItem('users', JSON.stringify(users));
            this.currentUser.points = user.points;
            this.saveUser();
        }
    },
    
    addAppointment(appointment) {
        if (!this.currentUser) return;
        
        const users = this.getUsers();
        const user = users.find(u => u.id === this.currentUser.id);
        
        if (user) {
            if (!user.appointments) {
                user.appointments = [];
            }
            user.appointments.push(appointment);
            localStorage.setItem('users', JSON.stringify(users));
            this.currentUser.appointments = user.appointments;
            this.saveUser();
        }
    },
    
    getUsers() {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    },
    
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },
    
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        
        if (this.currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                if (userName) {
                    userName.textContent = this.currentUser.name;
                }
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    
    const authModal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const registerFormElement = document.getElementById('registerFormElement');
    
    function showAuthModal(showRegister = false) {
        if (authModal) {
            authModal.classList.add('show');
            if (showRegister) {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            } else {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            }
        }
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showAuthModal(false));
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => showAuthModal(true));
    }
    
    if (ctaRegisterBtn) {
        ctaRegisterBtn.addEventListener('click', () => showAuthModal(true));
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                auth.logout();
            }
        });
    }
    
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }
    
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            try {
                auth.login(email, password);
                authModal.classList.remove('show');
                showNotification('Login successful!');
                auth.updateUI();
                loginFormElement.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
    
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 8) {
                showNotification('Password must be at least 8 characters', 'error');
                return;
            }
            
            try {
                auth.register({ name, email, phone, password });
                authModal.classList.remove('show');
                showNotification('Account created successfully!');
                auth.updateUI();
                registerFormElement.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
});

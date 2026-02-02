const express = require('express');
const router = express.Router();
const { inputValidation, passwordSecurity, sessionSecurity } = require('../security/middleware');

const sessions = new Map();
const users = new Map();

router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
        
        if (!inputValidation.validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
        
        if (!inputValidation.validatePhone(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number'
            });
        }
        
        if (!inputValidation.validatePassword(password)) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
            });
        }
        
        const existingUser = Array.from(users.values()).find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        const hashedPassword = await passwordSecurity.hash(password);
        
        const userId = Date.now().toString();
        const newUser = {
            id: userId,
            name: inputValidation.sanitizeString(name),
            email: email.toLowerCase(),
            phone: inputValidation.sanitizeString(phone),
            password: hashedPassword,
            points: 0,
            appointments: [],
            createdAt: new Date().toISOString()
        };
        
        users.set(userId, newUser);
        
        const sessionId = sessionSecurity.generateSessionId();
        sessions.set(sessionId, {
            userId,
            createdAt: Date.now()
        });
        
        const userResponse = { ...newUser };
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            user: userResponse,
            sessionId
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        const user = Array.from(users.values()).find(u => u.email === email.toLowerCase());
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        const isValidPassword = await passwordSecurity.verify(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        const sessionId = sessionSecurity.generateSessionId();
        sessions.set(sessionId, {
            userId: user.id,
            createdAt: Date.now()
        });
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            success: true,
            user: userResponse,
            sessionId
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

router.post('/logout', (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (sessionId) {
            sessions.delete(sessionId);
        }
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed'
        });
    }
});

router.get('/verify', (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        
        if (!sessionId || !sessionSecurity.validateSession(sessionId, sessions)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session'
            });
        }
        
        const session = sessions.get(sessionId);
        const user = users.get(session.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            success: true,
            user: userResponse
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Verification failed'
        });
    }
});

module.exports = router;
module.exports.sessions = sessions;
module.exports.users = users;

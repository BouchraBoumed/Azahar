const express = require('express');
const router = express.Router();
const { inputValidation, sessionSecurity } = require('../security/middleware');
const { sessions, users } = require('./auth');

const authenticateSession = (req, res, next) => {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId || !sessionSecurity.validateSession(sessionId, sessions)) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }
    
    const session = sessions.get(sessionId);
    req.userId = session.userId;
    next();
};

router.get('/profile', authenticateSession, (req, res) => {
    try {
        const user = users.get(req.userId);
        
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
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve profile'
        });
    }
});

router.patch('/profile', authenticateSession, (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = users.get(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        if (email && email !== user.email) {
            if (!inputValidation.validateEmail(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email format'
                });
            }
            
            const emailExists = Array.from(users.values()).find(
                u => u.email === email.toLowerCase() && u.id !== req.userId
            );
            
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already in use'
                });
            }
            
            user.email = email.toLowerCase();
        }
        
        if (name) {
            user.name = inputValidation.sanitizeString(name);
        }
        
        if (phone) {
            if (!inputValidation.validatePhone(phone)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid phone number'
                });
            }
            user.phone = inputValidation.sanitizeString(phone);
        }
        
        user.updatedAt = new Date().toISOString();
        
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            success: true,
            user: userResponse
        });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

router.get('/points', authenticateSession, (req, res) => {
    try {
        const user = users.get(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            points: user.points || 0
        });
        
    } catch (error) {
        console.error('Get points error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve points'
        });
    }
});

module.exports = router;

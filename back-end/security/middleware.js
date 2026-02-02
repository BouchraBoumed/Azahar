const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const crypto = require('crypto');

const securityMiddleware = (app) => {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', limiter);

    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        message: 'Too many login attempts, please try again later.',
        skipSuccessfulRequests: true,
    });
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);

    app.use(mongoSanitize());
    
    app.use(xss());
    
    app.use(hpp());

    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        optionsSuccessStatus: 200
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        next();
    });
};

const csrfProtection = () => {
    const tokens = new Map();
    
    return {
        generateToken: (sessionId) => {
            const token = crypto.randomBytes(32).toString('hex');
            tokens.set(sessionId, token);
            setTimeout(() => tokens.delete(sessionId), 3600000);
            return token;
        },
        
        validateToken: (sessionId, token) => {
            const storedToken = tokens.get(sessionId);
            if (!storedToken || storedToken !== token) {
                return false;
            }
            tokens.delete(sessionId);
            return true;
        }
    };
};

const inputValidation = {
    sanitizeString: (str) => {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>]/g, '');
    },
    
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    validatePhone: (phone) => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },
    
    validatePassword: (password) => {
        return password.length >= 8 && 
               /[A-Z]/.test(password) && 
               /[a-z]/.test(password) && 
               /[0-9]/.test(password);
    },
    
    validateDate: (dateStr) => {
        const date = new Date(dateStr);
        return date instanceof Date && !isNaN(date) && date > new Date();
    },
    
    sanitizeObject: (obj) => {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = inputValidation.sanitizeString(value);
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = inputValidation.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};

const passwordSecurity = {
    hash: async (password) => {
        const bcrypt = require('bcrypt');
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    },
    
    verify: async (password, hash) => {
        const bcrypt = require('bcrypt');
        return await bcrypt.compare(password, hash);
    },
    
    generateResetToken: () => {
        return crypto.randomBytes(32).toString('hex');
    }
};

const sessionSecurity = {
    generateSessionId: () => {
        return crypto.randomBytes(32).toString('hex');
    },
    
    validateSession: (sessionId, sessions) => {
        const session = sessions.get(sessionId);
        if (!session) return false;
        
        if (Date.now() - session.createdAt > 3600000) {
            sessions.delete(sessionId);
            return false;
        }
        
        return true;
    }
};

const fileUploadSecurity = {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024,
    
    validateFile: (file) => {
        if (!file) return { valid: false, error: 'No file provided' };
        
        if (!fileUploadSecurity.allowedMimeTypes.includes(file.mimetype)) {
            return { valid: false, error: 'Invalid file type' };
        }
        
        if (file.size > fileUploadSecurity.maxFileSize) {
            return { valid: false, error: 'File too large' };
        }
        
        return { valid: true };
    },
    
    sanitizeFilename: (filename) => {
        return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: err.message
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized access'
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};

module.exports = {
    securityMiddleware,
    csrfProtection,
    inputValidation,
    passwordSecurity,
    sessionSecurity,
    fileUploadSecurity,
    errorHandler
};

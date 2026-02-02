const express = require('express');
const router = express.Router();
const { inputValidation, sessionSecurity } = require('../security/middleware');
const { sessions, users } = require('./auth');

const appointments = new Map();

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

router.post('/', authenticateSession, async (req, res) => {
    try {
        const { date, time, services, total, paymentMethod, specialRequests } = req.body;
        
        if (!date || !time || !services || !total || !paymentMethod) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        if (!inputValidation.validateDate(date)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date'
            });
        }
        
        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one service is required'
            });
        }
        
        const validPaymentMethods = ['credit-card', 'paypal', 'cash', 'bank-transfer'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment method'
            });
        }
        
        const appointmentId = Date.now().toString();
        const appointment = {
            id: appointmentId,
            userId: req.userId,
            date,
            time,
            services: services.map(s => inputValidation.sanitizeObject(s)),
            total: parseFloat(total),
            paymentMethod,
            specialRequests: specialRequests ? inputValidation.sanitizeString(specialRequests) : '',
            status: 'upcoming',
            images: [],
            createdAt: new Date().toISOString()
        };
        
        appointments.set(appointmentId, appointment);
        
        const user = users.get(req.userId);
        if (user) {
            const pointsEarned = Math.floor(total * 10);
            user.points = (user.points || 0) + pointsEarned;
            
            if (!user.appointments) {
                user.appointments = [];
            }
            user.appointments.push(appointment);
        }
        
        res.status(201).json({
            success: true,
            appointment,
            pointsEarned: Math.floor(total * 10)
        });
        
    } catch (error) {
        console.error('Appointment creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create appointment'
        });
    }
});

router.get('/', authenticateSession, (req, res) => {
    try {
        const userAppointments = Array.from(appointments.values())
            .filter(apt => apt.userId === req.userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({
            success: true,
            appointments: userAppointments
        });
        
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve appointments'
        });
    }
});

router.get('/:id', authenticateSession, (req, res) => {
    try {
        const appointment = appointments.get(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        if (appointment.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        res.json({
            success: true,
            appointment
        });
        
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve appointment'
        });
    }
});

router.patch('/:id/status', authenticateSession, (req, res) => {
    try {
        const { status } = req.body;
        const appointment = appointments.get(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        if (appointment.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }
        
        const validStatuses = ['upcoming', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }
        
        appointment.status = status;
        appointment.updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            appointment
        });
        
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update appointment'
        });
    }
});

router.post('/:id/images', authenticateSession, (req, res) => {
    try {
        const { imageUrl } = req.body;
        const appointment = appointments.get(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found'
            });
        }
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'Image URL is required'
            });
        }
        
        if (!appointment.images) {
            appointment.images = [];
        }
        
        appointment.images.push(imageUrl);
        appointment.updatedAt = new Date().toISOString();
        
        res.json({
            success: true,
            appointment
        });
        
    } catch (error) {
        console.error('Add image error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add image'
        });
    }
});

module.exports = router;

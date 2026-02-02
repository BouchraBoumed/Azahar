const express = require('express');
const router = express.Router();

const services = [
    {
        id: 'hair-cut',
        name: 'Haircut & Styling',
        category: 'hair',
        price: 45.00,
        duration: '60 min',
        icon: '💇',
        description: 'Professional haircut with styling'
    },
    {
        id: 'hair-color',
        name: 'Hair Coloring',
        category: 'hair',
        price: 85.00,
        duration: '120 min',
        icon: '🎨',
        description: 'Full hair coloring service'
    },
    {
        id: 'hair-treatment',
        name: 'Hair Treatment',
        category: 'hair',
        price: 65.00,
        duration: '90 min',
        icon: '✨',
        description: 'Deep conditioning treatment'
    },
    {
        id: 'manicure',
        name: 'Manicure',
        category: 'nails',
        price: 35.00,
        duration: '45 min',
        icon: '💅',
        description: 'Classic manicure service'
    },
    {
        id: 'pedicure',
        name: 'Pedicure',
        category: 'nails',
        price: 45.00,
        duration: '60 min',
        icon: '🦶',
        description: 'Relaxing pedicure service'
    },
    {
        id: 'gel-nails',
        name: 'Gel Nails',
        category: 'nails',
        price: 55.00,
        duration: '75 min',
        icon: '💎',
        description: 'Long-lasting gel nail application'
    },
    {
        id: 'facial',
        name: 'Facial Treatment',
        category: 'spa',
        price: 75.00,
        duration: '60 min',
        icon: '🧖',
        description: 'Rejuvenating facial treatment'
    },
    {
        id: 'massage',
        name: 'Relaxation Massage',
        category: 'spa',
        price: 95.00,
        duration: '90 min',
        icon: '💆',
        description: 'Full body relaxation massage'
    },
    {
        id: 'body-scrub',
        name: 'Body Scrub',
        category: 'spa',
        price: 70.00,
        duration: '60 min',
        icon: '🌸',
        description: 'Exfoliating body scrub'
    },
    {
        id: 'makeup',
        name: 'Makeup Application',
        category: 'beauty',
        price: 60.00,
        duration: '60 min',
        icon: '💄',
        description: 'Professional makeup application'
    },
    {
        id: 'eyebrows',
        name: 'Eyebrow Shaping',
        category: 'beauty',
        price: 25.00,
        duration: '30 min',
        icon: '👁️',
        description: 'Eyebrow shaping and tinting'
    },
    {
        id: 'eyelashes',
        name: 'Eyelash Extensions',
        category: 'beauty',
        price: 120.00,
        duration: '120 min',
        icon: '👀',
        description: 'Premium eyelash extensions'
    }
];

router.get('/', (req, res) => {
    try {
        const { category } = req.query;
        
        let filteredServices = services;
        
        if (category && category !== 'all') {
            filteredServices = services.filter(s => s.category === category);
        }
        
        res.json({
            success: true,
            services: filteredServices
        });
        
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve services'
        });
    }
});

router.get('/:id', (req, res) => {
    try {
        const service = services.find(s => s.id === req.params.id);
        
        if (!service) {
            return res.status(404).json({
                success: false,
                error: 'Service not found'
            });
        }
        
        res.json({
            success: true,
            service
        });
        
    } catch (error) {
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve service'
        });
    }
});

router.get('/categories/list', (req, res) => {
    try {
        const categories = [...new Set(services.map(s => s.category))];
        
        res.json({
            success: true,
            categories
        });
        
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve categories'
        });
    }
});

module.exports = router;

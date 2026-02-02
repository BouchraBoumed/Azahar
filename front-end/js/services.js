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

function renderServices(filter = 'all') {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;
    
    const filteredServices = filter === 'all' 
        ? services 
        : services.filter(s => s.category === filter);
    
    servicesGrid.innerHTML = filteredServices.map(service => `
        <div class="service-card" data-category="${service.category}">
            <div class="service-image">
                ${service.icon}
            </div>
            <div class="service-content">
                <h3>${escapeHtml(service.name)}</h3>
                <p>${escapeHtml(service.description)}</p>
                <div class="service-price">$${service.price.toFixed(2)}</div>
                <div class="service-duration">⏱️ ${service.duration}</div>
                <button class="btn-primary add-to-cart-btn" onclick="addServiceToCart('${service.id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function addServiceToCart(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        cart.add(service);
        showNotification(`${service.name} added to cart!`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            renderServices(category);
        });
    });
});

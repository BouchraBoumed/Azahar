const cart = {
    items: [],
    
    add(service) {
        const existingItem = this.items.find(item => item.id === service.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({ ...service, quantity: 1 });
        }
        this.save();
        this.updateUI();
    },
    
    remove(serviceId) {
        this.items = this.items.filter(item => item.id !== serviceId);
        this.save();
        this.updateUI();
    },
    
    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    },
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },
    
    load() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.items = JSON.parse(saved);
        }
    },
    
    updateUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
        
        const cartItems = document.getElementById('cartItems');
        if (cartItems) {
            if (this.items.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <button class="remove-item" onclick="cart.remove('${item.id}')">Remove</button>
                    </div>
                `).join('');
            }
        }
        
        const cartTotal = document.getElementById('cartTotal');
        if (cartTotal) {
            cartTotal.textContent = this.getTotal().toFixed(2);
        }
        
        const reservationCartItems = document.getElementById('reservationCartItems');
        if (reservationCartItems) {
            if (this.items.length === 0) {
                reservationCartItems.innerHTML = '<p style="text-align: center; color: #666;">No services selected</p>';
            } else {
                reservationCartItems.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <h4>${escapeHtml(item.name)}</h4>
                            <p>Quantity: ${item.quantity}</p>
                            <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
        
        const reservationTotal = document.getElementById('reservationTotal');
        if (reservationTotal) {
            reservationTotal.textContent = this.getTotal().toFixed(2);
        }
        
        const pointsToEarn = document.getElementById('pointsToEarn');
        if (pointsToEarn) {
            pointsToEarn.textContent = Math.floor(this.getTotal() * 10);
        }
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background-color: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideInRight 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    cart.load();
    cart.updateUI();
    
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartBtn && cartModal) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.classList.add('show');
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.items.length === 0) {
                showNotification('Your cart is empty', 'error');
                return;
            }
            window.location.href = 'reservations.html';
        });
    }
    
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('show');
        });
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

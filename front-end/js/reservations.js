function generateCSRFToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function validateCardNumber(number) {
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formatted;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

document.addEventListener('DOMContentLoaded', () => {
    cart.updateUI();
    
    const appointmentDate = document.getElementById('appointmentDate');
    if (appointmentDate) {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        appointmentDate.min = today.toISOString().split('T')[0];
        
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        appointmentDate.max = maxDate.toISOString().split('T')[0];
    }
    
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardPaymentDetails = document.getElementById('cardPaymentDetails');
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            if (method.value === 'credit-card') {
                cardPaymentDetails.classList.remove('hidden');
                document.getElementById('cardNumber').required = true;
                document.getElementById('cardExpiry').required = true;
                document.getElementById('cardCVV').required = true;
            } else {
                cardPaymentDetails.classList.add('hidden');
                document.getElementById('cardNumber').required = false;
                document.getElementById('cardExpiry').required = false;
                document.getElementById('cardCVV').required = false;
            }
        });
    });
    
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', () => formatCardNumber(cardNumber));
    }
    
    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', () => formatExpiry(cardExpiry));
    }
    
    const cardCVV = document.getElementById('cardCVV');
    if (cardCVV) {
        cardCVV.addEventListener('input', () => {
            cardCVV.value = cardCVV.value.replace(/\D/g, '');
        });
    }
    
    if (auth.currentUser) {
        const customerName = document.getElementById('customerName');
        const customerEmail = document.getElementById('customerEmail');
        const customerPhone = document.getElementById('customerPhone');
        
        if (customerName) customerName.value = auth.currentUser.name;
        if (customerEmail) customerEmail.value = auth.currentUser.email;
        if (customerPhone) customerPhone.value = auth.currentUser.phone;
    }
    
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (cart.items.length === 0) {
                showNotification('Please add services to your cart first', 'error');
                return;
            }
            
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
            if (!paymentMethod) {
                showNotification('Please select a payment method', 'error');
                return;
            }
            
            if (paymentMethod.value === 'credit-card') {
                const cardNum = document.getElementById('cardNumber').value;
                if (!validateCardNumber(cardNum)) {
                    showNotification('Invalid card number', 'error');
                    return;
                }
                
                const expiry = document.getElementById('cardExpiry').value;
                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                if (!expiryRegex.test(expiry)) {
                    showNotification('Invalid expiry date (MM/YY)', 'error');
                    return;
                }
                
                const cvv = document.getElementById('cardCVV').value;
                if (!/^\d{3,4}$/.test(cvv)) {
                    showNotification('Invalid CVV', 'error');
                    return;
                }
            }
            
            const appointment = {
                id: Date.now().toString(),
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                customerName: document.getElementById('customerName').value,
                customerEmail: document.getElementById('customerEmail').value,
                customerPhone: document.getElementById('customerPhone').value,
                specialRequests: document.getElementById('specialRequests').value,
                services: [...cart.items],
                total: cart.getTotal(),
                paymentMethod: paymentMethod.value,
                status: 'upcoming',
                createdAt: new Date().toISOString(),
                csrfToken: generateCSRFToken()
            };
            
            const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            appointments.push(appointment);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            if (auth.currentUser) {
                const pointsEarned = Math.floor(appointment.total * 10);
                auth.addPoints(pointsEarned);
                auth.addAppointment(appointment);
            }
            
            cart.clear();
            
            const confirmationModal = document.getElementById('confirmationModal');
            if (confirmationModal) {
                confirmationModal.classList.add('show');
            }
            
            reservationForm.reset();
            
            setTimeout(() => {
                window.location.href = 'account.html';
            }, 3000);
        });
    }
    
    const closeConfirmation = document.getElementById('closeConfirmation');
    if (closeConfirmation) {
        closeConfirmation.addEventListener('click', () => {
            document.getElementById('confirmationModal').classList.remove('show');
            window.location.href = 'account.html';
        });
    }
});

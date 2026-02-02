document.addEventListener('DOMContentLoaded', () => {
    const loginPrompt = document.getElementById('loginPrompt');
    const accountContent = document.getElementById('accountContent');
    const promptLoginBtn = document.getElementById('promptLoginBtn');
    
    if (!auth.currentUser) {
        if (loginPrompt) loginPrompt.classList.remove('hidden');
        if (accountContent) accountContent.classList.add('hidden');
        
        if (promptLoginBtn) {
            promptLoginBtn.addEventListener('click', () => {
                document.getElementById('loginBtn').click();
            });
        }
        return;
    }
    
    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (accountContent) accountContent.classList.remove('hidden');
    
    loadAccountData();
    
    const accountNavBtns = document.querySelectorAll('.account-nav-btn');
    accountNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            accountNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
            document.getElementById(`${tab}Tab`).classList.add('active');
        });
    });
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('profileNameInput').value.trim();
            const email = document.getElementById('profileEmailInput').value.trim();
            const phone = document.getElementById('profilePhoneInput').value.trim();
            
            try {
                auth.updateProfile({ name, email, phone });
                showNotification('Profile updated successfully!');
                loadAccountData();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            
            if (newPassword !== confirmNewPassword) {
                showNotification('New passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showNotification('Password must be at least 8 characters', 'error');
                return;
            }
            
            try {
                auth.changePassword(currentPassword, newPassword);
                showNotification('Password changed successfully!');
                passwordForm.reset();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }
});

function loadAccountData() {
    if (!auth.currentUser) return;
    
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileInitials = document.getElementById('profileInitials');
    const userPoints = document.getElementById('userPoints');
    
    if (profileName) profileName.textContent = auth.currentUser.name;
    if (profileEmail) profileEmail.textContent = auth.currentUser.email;
    if (userPoints) userPoints.textContent = auth.currentUser.points || 0;
    
    if (profileInitials) {
        const initials = auth.currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        profileInitials.textContent = initials;
    }
    
    const profileNameInput = document.getElementById('profileNameInput');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const profilePhoneInput = document.getElementById('profilePhoneInput');
    
    if (profileNameInput) profileNameInput.value = auth.currentUser.name;
    if (profileEmailInput) profileEmailInput.value = auth.currentUser.email;
    if (profilePhoneInput) profilePhoneInput.value = auth.currentUser.phone;
    
    loadAppointmentHistory();
}

function loadAppointmentHistory() {
    const appointmentHistory = document.getElementById('appointmentHistory');
    if (!appointmentHistory) return;
    
    const users = auth.getUsers();
    const user = users.find(u => u.id === auth.currentUser.id);
    
    if (!user || !user.appointments || user.appointments.length === 0) {
        appointmentHistory.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">No appointments yet</p>
                <p>Book your first appointment to see your history here</p>
                <a href="services.html" class="btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Browse Services</a>
            </div>
        `;
        return;
    }
    
    const sortedAppointments = [...user.appointments].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    appointmentHistory.innerHTML = sortedAppointments.map(appointment => {
        const appointmentDate = new Date(appointment.date);
        const formattedDate = appointmentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const statusClass = `status-${appointment.status}`;
        const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
        
        return `
            <div class="appointment-card">
                <div class="appointment-header">
                    <div class="appointment-date">
                        📅 ${formattedDate} at ${appointment.time}
                    </div>
                    <div class="appointment-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                
                <div class="appointment-services">
                    <h4>Services:</h4>
                    <ul>
                        ${appointment.services.map(service => `
                            <li>${escapeHtml(service.name)} - $${service.price.toFixed(2)} ${service.quantity > 1 ? `(x${service.quantity})` : ''}</li>
                        `).join('')}
                    </ul>
                </div>
                
                ${appointment.images && appointment.images.length > 0 ? `
                    <div class="appointment-images">
                        ${appointment.images.map(img => `
                            <img src="${img}" alt="Appointment result" class="appointment-image" onclick="showImageModal('${img}')">
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="appointment-total">
                    Total: $${appointment.total.toFixed(2)}
                </div>
                
                ${appointment.specialRequests ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <strong>Special Requests:</strong> ${escapeHtml(appointment.specialRequests)}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function showImageModal(imageSrc) {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (imageModal && modalImage) {
        modalImage.src = imageSrc;
        imageModal.classList.add('show');
    }
}

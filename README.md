# Azahar - Secure Booking System

A secure, full-featured booking and appointment management system with user authentication, shopping cart, payment processing, and rewards program.

## Features

### Frontend
- **4 Main Pages**: Home, Services, Reservations, Account
- **Shopping Cart System**: Add services to cart and manage selections
- **User Authentication**: Secure login and registration
- **Payment Methods**: Credit/Debit Card, PayPal, Cash, Bank Transfer
- **Rewards Program**: Earn 10 points per dollar spent
- **Appointment History**: View past appointments with images
- **Responsive Design**: Mobile-friendly interface

### Backend
- **Secure API**: RESTful API with comprehensive security
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: XSS and injection attack prevention
- **CSRF Protection**: Token-based CSRF protection
- **Security Headers**: Helmet.js for HTTP security headers

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Minimum 8 characters with complexity requirements
   - Secure password reset functionality

2. **Input Validation**
   - Email format validation
   - Phone number validation
   - SQL injection prevention
   - XSS attack prevention
   - HTML sanitization

3. **Session Management**
   - Secure session tokens
   - Automatic session expiration
   - Session validation on each request

4. **Rate Limiting**
   - API rate limiting (100 requests per 15 minutes)
   - Authentication rate limiting (5 attempts per 15 minutes)

5. **HTTP Security**
   - Content Security Policy
   - HSTS (HTTP Strict Transport Security)
   - X-Frame-Options
   - X-Content-Type-Options
   - XSS Protection headers

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd back-end
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Open `front-end/index.html` in a web browser
2. Or serve with a local server:
```bash
cd front-end
python -m http.server 3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify session

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/categories/list` - Get all categories

### Appointments
- `POST /api/appointments` - Create appointment (authenticated)
- `GET /api/appointments` - Get user appointments (authenticated)
- `GET /api/appointments/:id` - Get appointment by ID (authenticated)
- `PATCH /api/appointments/:id/status` - Update appointment status (authenticated)
- `POST /api/appointments/:id/images` - Add images to appointment (authenticated)

### Users
- `GET /api/users/profile` - Get user profile (authenticated)
- `PATCH /api/users/profile` - Update user profile (authenticated)
- `GET /api/users/points` - Get user points (authenticated)

## Usage

### For Customers

1. **Browse Services**: Visit the Services page to view available services
2. **Add to Cart**: Select services and add them to your cart
3. **Create Account**: Register for an account to earn rewards points
4. **Make Reservation**: Fill out the booking form with your details
5. **Choose Payment**: Select your preferred payment method
6. **View History**: Check your appointment history in the Account page

### For Administrators

- Appointments are stored in the backend
- User data is securely managed with encrypted passwords
- Session management ensures secure access
- Rate limiting prevents abuse

## Technologies Used

### Frontend
- HTML5
- CSS3 (Custom styling with CSS variables)
- Vanilla JavaScript (ES6+)
- LocalStorage for client-side data

### Backend
- Node.js
- Express.js
- Helmet.js (Security headers)
- Bcrypt (Password hashing)
- Express Rate Limit (Rate limiting)
- XSS-Clean (XSS prevention)
- HPP (HTTP Parameter Pollution prevention)
- CORS (Cross-Origin Resource Sharing)

## Security Best Practices

1. Always use HTTPS in production
2. Change default secrets in `.env` file
3. Regularly update dependencies
4. Monitor logs for suspicious activity
5. Implement database backups
6. Use environment variables for sensitive data
7. Enable CORS only for trusted domains

## Future Enhancements

- Email notifications for appointments
- SMS reminders
- Payment gateway integration (Stripe, PayPal)
- Admin dashboard for managing appointments
- Calendar view for availability
- Image upload for appointment results
- Multi-language support
- Advanced analytics

## License

ISC

## Support

For issues or questions, please contact the development team.

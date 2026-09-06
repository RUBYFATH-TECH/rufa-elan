# RUFA ELAN - E-commerce Platform

A modern MERN stack e-commerce platform for fashion accessories and handbags with a Temu-inspired UI/UX design.

## 📁 Project Structure

```
rufa-elan/
├── backend/           # Express.js API server
│   ├── src/          # Source code
│   ├── .env          # Backend environment variables
│   └── package.json  # Backend dependencies
├── frontend/         # Next.js client application  
│   ├── app/         # Next.js app directory
│   ├── components/  # React components
│   ├── lib/         # Utility libraries
│   ├── store/       # State management
│   ├── .env.local   # Frontend environment variables
│   └── package.json # Frontend dependencies
├── docs/            # Project documentation
├── .env             # Shared environment variables
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rufa-elan
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files and update with your values
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```

4. **Start the application**
   ```bash
   # Start backend (from backend directory)
   cd backend
   npm run dev
   
   # Start frontend (from frontend directory) - in new terminal
   cd frontend
   npm run dev
   ```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api-docs (if implemented)

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Framework**: Express.js
- **Language**: TypeScript/JavaScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: Cloudinary
- **Payment**: Paystack integration
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate limiting

### Development Tools
- **Package Manager**: npm
- **Code Formatting**: Prettier
- **Linting**: ESLint
- **Build Tool**: Next.js build system

## 🎨 UI/UX Features

- **Temu-inspired Design**: High-density product layouts with social proof
- **Lightning Deals**: Countdown timers and stock progress indicators
- **Advanced Filtering**: Sort by price, rating, shipping options
- **Mobile-First**: Responsive design optimized for all devices
- **Trust Indicators**: Purchase protection, free shipping, ratings
- **Interactive Elements**: Wishlist, cart, quick view, hover effects

## 🔧 Available Scripts

### Frontend (from `/frontend`)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Backend (from `/backend`)
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

## 📝 Environment Variables

### Root `.env` (Shared)
- Database connections
- JWT secrets
- Email configuration
- File upload settings

### Frontend `.env.local`
- Next.js specific variables
- Public API keys
- Client-side configuration

### Backend `.env`
- Server configuration
- Private API keys
- Database credentials

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Configure environment variables

### Backend Deployment (Railway/Heroku)
1. Connect your repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Configure environment variables
5. Set up MongoDB Atlas connection

## 📊 Features

- **Product Management**: CRUD operations for products
- **User Authentication**: Register, login, password reset
- **Shopping Cart**: Add, remove, update quantities
- **Wishlist**: Save favorite products
- **Order Management**: Place and track orders
- **Payment Integration**: Secure payment processing
- **Admin Dashboard**: Manage products, orders, customers
- **Real-time Order Tracking**: Live delivery status
- **Responsive Design**: Mobile and desktop optimized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

Built with ❤️ for RUFA ELAN by the development team.
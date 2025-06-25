# React Survivor - Frontend

A sophisticated React-based frontend application demonstrating advanced full-stack development skills through a comprehensive Survivor fantasy league platform featuring real-time draft functionality, complex state management, and enterprise-level architecture.

## 🎯 Technical Highlights

### **Advanced React Development**
- **React 19**: Leveraging latest React features with modern hooks and patterns
- **Complex State Management**: Multi-level state coordination across real-time features
- **Performance Optimization**: Efficient re-rendering and memory management
- **Custom Hook Architecture**: Reusable logic abstraction for API calls and state management

### **Real-time System Architecture**
- **WebSocket Integration**: Bi-directional real-time communication with automatic reconnection
- **Event-driven Architecture**: Sophisticated message handling and state synchronization
- **Concurrent User Management**: Multi-user real-time interactions with conflict resolution
- **Timer Synchronization**: Precision timing across distributed clients

### **Enterprise-level Features**
- **Authentication & Authorization**: JWT-based security with role-based access control
- **Progressive Web App**: Service worker implementation with offline capabilities
- **Responsive Design**: Mobile-first approach with touch gesture support
- **Error Handling**: Comprehensive error boundaries and user feedback systems

## 🏆 Core Application Features

### 🎯 Fantasy League Management
- **Multi-tenant Architecture**: Support for multiple leagues with isolated data
- **Complex Data Visualization**: Interactive standings with real-time statistics
- **Performance Analytics**: Detailed player scoring with episode-level breakdowns
- **Dynamic Content Management**: User-generated content with administrative oversight

### 📊 Survey & Polling System
- **Dynamic Form Generation**: Runtime form creation with complex validation
- **Temporal State Management**: Time-based form locking and state transitions
- **Data Analytics**: Poll results aggregation and performance tracking
- **Business Logic Implementation**: Episode-specific workflow automation

### 🚨 Real-time Draft System
- **Live Drafting**: WebSocket-based real-time draft with sub-second latency
- **Advanced UI/UX**: Color-coded visual feedback with progressive urgency indicators
- **Audio Integration**: HTML5 Audio API with browser compatibility handling
- **Smart State Management**: Complex validation logic preventing race conditions
- **Responsive Layout**: Custom draggable split-pane with touch support
- **Cross-platform Compatibility**: Consistent experience across devices and browsers

### 📝 Communications & Notifications
- **Real-time Messaging**: Admin-to-user communication system
- **Content Management**: Rich text handling with expandable content views
- **Timestamp Precision**: Advanced date/time formatting with timezone handling

### ⚙️ User Management & Security
- **Enterprise Authentication**: JWT-based security with automatic token refresh
- **Role-based Authorization**: Granular permission system with route protection
- **Session Management**: Persistent user sessions with security best practices

### 🔧 Administrative Dashboard
- **Full CRUD Operations**: Complete data management with validation and error handling
- **Content Management System**: Episode, player, and survey administration
- **Business Intelligence**: League analytics and performance monitoring
- **Workflow Automation**: Automated processes for league management

## 🛠️ Technical Architecture & Skills Demonstrated

### **Frontend Excellence**
- **Modern React Ecosystem**: React 19, React Router, Custom Hooks
- **State Management**: Complex state coordination across components and real-time features
- **Performance Optimization**: Efficient rendering, memory management, and bundle optimization
- **TypeScript Ready**: Architecture designed for easy TypeScript migration

### **UI/UX Engineering**
- **Design Systems**: Bootstrap 5 integration with custom component library
- **Responsive Design**: Mobile-first development with cross-device compatibility
- **Accessibility**: ARIA compliance and keyboard navigation support
- **Progressive Enhancement**: Graceful degradation for older browsers

### **Real-time & WebSocket Development**
- **Bi-directional Communication**: Complex WebSocket event handling and state synchronization
- **Connection Management**: Automatic reconnection, heartbeat monitoring, and error recovery
- **Concurrent Users**: Multi-user state management with conflict resolution
- **Performance**: Sub-second latency with optimized message handling

### **Security & Authentication**
- **JWT Implementation**: Secure token management with automatic refresh
- **Route Protection**: Role-based access control with React Router guards
- **Input Validation**: Client-side validation with server-side security
- **XSS Prevention**: Secure content rendering and user input handling

### **DevOps & Build Tools**
- **Modern Build Pipeline**: Vite for fast development and optimized production builds
- **Code Quality**: ESLint configuration for consistent code standards
- **Progressive Web App**: Service worker implementation for offline functionality
- **Deployment Ready**: Optimized builds with environment configuration

## 📈 Project Scope & Complexity

This application demonstrates enterprise-level development skills through:

- **Full-Stack Integration**: Seamless frontend-backend communication with RESTful APIs and WebSocket connections
- **Scalable Architecture**: Component-based design supporting multiple leagues and concurrent users
- **Business Logic Implementation**: Complex game rules, scoring systems, and temporal workflows
- **Data Management**: Sophisticated state management across multiple data sources and real-time updates
- **Production Readiness**: Comprehensive error handling, security measures, and deployment optimization

**Lines of Code**: 4,000+ lines of production-quality React code
**Components**: 25+ custom React components with reusable design patterns
**Features**: 15+ major feature sets with complex user interactions
**Real-time Events**: 10+ WebSocket event types with state synchronization

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API server running

## � Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Ensure backend API server is running
   - Configure API endpoints in `src/apiUrls.js`
   - Configure WebSocket URLs in `src/websocketUrls.js`

3. **Development Mode**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── assets/              # Static assets, custom CSS, images, audio
│   ├── bootstrap.min.css
│   ├── draft.css       # Draft-specific styling
│   ├── league.css      # League page styling
│   ├── my-team.css     # Team display styling
│   ├── admin-players.css
│   ├── nfl-draft-chime.mp3
│   └── island.png      # League branding
├── components/          # Reusable React components
│   ├── Main.jsx        # Standard page layout wrapper
│   ├── AdminMain.jsx   # Admin panel layout
│   ├── RequireUser.jsx # Authentication guard
│   ├── RequireAdmin.jsx # Admin authorization guard
│   ├── WaterLoader.jsx # Animated loading component
│   └── DotLoader.jsx   # Alternative loading animation
├── helpers/
│   └── helpers.js      # Utility functions and API helpers
├── pages/              # Main application pages
│   ├── Home.jsx        # Team dashboard and league list
│   ├── League.jsx      # Main league interface with tabbed views
│   ├── Draft.jsx       # Real-time draft interface
│   ├── Login.jsx       # Authentication page
│   ├── Settings.jsx    # User profile management
│   ├── Notes.jsx       # Admin announcements view
│   ├── Admin*.jsx      # Admin panel pages
│   └── LeagueComponents/ # League sub-components
│       ├── TeamStandings.jsx
│       ├── PlayerStandings.jsx
│       ├── MyTeam.jsx
│       ├── Survey.jsx
│       ├── MyPolls.jsx
│       ├── Settings.jsx
│       └── Draft.jsx
├── apiUrls.js          # API endpoint configuration
├── websocketUrls.js    # WebSocket configuration
├── App.jsx             # Main app with routing
└── main.jsx            # React entry point
```

## 🎯 Key Components

### League.jsx
Central hub for league functionality with tabbed interface:
- Team standings with win/loss records
- Player performance rankings
- Personal team management
- Weekly surveys and polls
- League settings and draft access

### Draft.jsx
Sophisticated real-time draft interface:
- Live websocket connection with automatic reconnection
- Timer system with visual and audio notifications
- Draggable split-pane layout for optimal viewing
- Color-coded urgency indicators
- Team validation and pick management
- Countdown timer for draft start

### Home.jsx
User dashboard displaying:
- All user teams across multiple leagues
- Quick league navigation
- Team and league summary information

### Admin Pages
Comprehensive administrative interface:
- **AdminEpisodes**: Manage Survivor episodes and air dates
- **AdminPlayers**: Full contestant database with photos and details
- **AdminSurveys**: Create weekly prediction surveys
- **AdminLeagues**: League creation and management
- **AdminNotes**: Send announcements to participants

### LeagueComponents
Modular components for league functionality:
- **MyTeam**: Detailed roster with expandable player statistics
- **Survey**: Weekly prediction forms with lockdown functionality
- **TeamStandings**: League leaderboard with detailed statistics
- **PlayerStandings**: Individual contestant performance tracking

## � Real-time Features

### WebSocket Events
- `join`: Connect to league draft room
- `pick-made`: Live draft pick updates
- `draft-timer-started`: Timer synchronization across clients
- `auto-pick-made`: Automatic pick notifications

### Live Updates
- Real-time draft progression
- Timer synchronization across all participants
- Instant pick notifications
- Draft state management

## 🎨 Styling & Design

### CSS Architecture
- **Bootstrap 5**: Base responsive framework
- **Custom CSS**: Component-specific styling
- **CSS Variables**: Consistent color schemes
- **Responsive Design**: Mobile-first approach

### Design System
- **Material-UI Icons**: Consistent iconography
- **Custom Loaders**: Branded loading animations
- **Color Coordination**: State-based color schemes
- **Typography**: Clear hierarchy and readability

## 📱 Progressive Web App

### PWA Features
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Installable on mobile devices
- **Icon Sets**: Complete icon packages for all platforms
- **Responsive Design**: Optimized for all screen sizes

### Mobile Optimization
- Touch-friendly interface elements
- Swipe gestures for navigation
- Optimized loading for mobile networks
- Native app-like experience

## 🔊 Audio & Notifications

### Audio System
- **Draft Chime**: NFL-style draft notification sound
- **Volume Control**: User-friendly audio levels
- **Browser Compatibility**: Graceful fallback for autoplay restrictions
- **Smart Triggering**: Only plays when state changes to user's turn

## 🔒 Security & Authentication

### Authentication System
- **JWT Tokens**: Secure, stateless authentication
- **Route Guards**: Protected routes with automatic redirects
- **Role-based Access**: User and admin permission levels
- **Token Validation**: Automatic token verification and refresh

### Authorization
- **RequireUser**: Standard user authentication guard
- **RequireAdmin**: Administrative access control
- **Team Ownership**: Proper validation for team-specific actions

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🔧 Configuration

### API Configuration
```javascript
// src/apiUrls.js
const apiUrl = 'your-api-base-url/api/';
export default apiUrl;
```

### WebSocket Configuration
```javascript
// src/websocketUrls.js
const websocketUrl = 'your-websocket-url';
export default websocketUrl;
```

## 🐛 Troubleshooting

### Common Issues

**Authentication Problems**
- Clear localStorage and re-login
- Check token expiration
- Verify API server connectivity

**WebSocket Connection Failed**
- Ensure backend API server is running
- Check WebSocket URL configuration
- Verify network connectivity and firewall settings

**Draft Issues**
- Verify system clock synchronization
- Check network connectivity
- Ensure proper team ownership

**Audio Not Playing**
- Browser may require user interaction first
- Check browser console for audio errors
- Verify MP3 file accessibility

## 🚀 Deployment

### Development
```bash
npm run dev
```
Starts Vite development server on `http://localhost:5173`

### Production
```bash
npm run build
```
Creates optimized build in `dist/` directory ready for deployment

### Environment Variables
Configure production API endpoints and WebSocket URLs for your deployment environment.

## 📊 Dependencies

### Core Dependencies
- **React 19**: Latest React framework
- **React Router**: Client-side routing
- **Bootstrap 5**: CSS framework
- **Material-UI**: Enhanced components and icons
- **Luxon**: DateTime handling and formatting
- **SweetAlert2**: Beautiful modal dialogs

### Development Tools
- **Vite**: Fast build tool and dev server
- **ESLint**: Code quality and consistency

## 📄 License

**Proprietary Software - All Rights Reserved**

Copyright (c) 2025 Brian Kaufman. All rights reserved.

This software and its source code are proprietary and confidential. No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright owner, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

**Restrictions:**
- No modification, adaptation, or derivative works are permitted without explicit written consent
- No redistribution, sublicensing, or sale of this software is permitted
- Source code access does not grant any rights to modify or distribute
- All modifications and updates must be performed exclusively by the copyright owner

For permission requests or licensing inquiries, contact the copyright owner.

---

For additional documentation, please refer to the API documentation.

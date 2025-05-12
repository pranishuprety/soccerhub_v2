# Soccer Hub

**CS 355 Full-Stack Development Final Project**

Soccer Hub is a full‑stack web application that provides soccer fans with up‑to‑date league standings, fixtures, and live scores, alongside a personalized user experience. Users can register, log in, and manage their profile, including selecting and persisting a favorite team.

This project satisfies the requirements for the CS 355 Full‑Stack Development final: implementing secure user authentication, a RESTful API with protected routes, CRUD operations for user data, and a dynamic front‑end interface.

## Features
- **Authentication**: Secure signup/login with bcrypt and JWT  
- **Favorites CRUD**: Create, read, update, delete your favorite team  
- **Live Data**: League standings, weekly fixtures & live scores via API-Football  
- **UX**: Dark/light toggle, mobile-friendly design  

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose)  
- **Frontend**: HTML5, CSS3, Vanilla JavaScript  

## Demo Video
https://youtu.be/vyD2LjQL0pc

## Quick Start
1. **Clone & Install**  
   ```bash
   git clone https://github.com/your-username/soccerhub_v2.git
   cd soccerhub_v2/server
   npm install

2. Configure your environment by creating a server/.env with MONGO_URI and JWT_SECRET
3. Run  the API: npm start
4. Open client/dashboard.html in your browser to start using Soccer Hub.


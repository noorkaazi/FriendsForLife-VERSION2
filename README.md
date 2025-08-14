# FriendsForLife-VERSION2

Friends for Life is a web application that helps users find pets for adoption or give away pets to loving homes. It includes user registration, login/logout, pet filtering, and a personalized submission system — all built with Node.js, Express, EJS, and vanilla JS.

## Features

- User registration & login system with session-based authentication
- Pet giveaway form (with validation)
- Pet search/filtering by species, breed, gender, and compatibility
- Matching pets displayed dynamically
- Persistent storage using flat `.txt` files (no database needed)
- Clean responsive layout with EJS partials and custom CSS

## Project Structure
SOEN287-Assignment3/QUESTION4
│
├── views/ # EJS templates (pages & partials)
├── public/ # CSS & JavaScript
├── pets.txt # Stores pet giveaway submissions
├── login.txt # Stores user credentials
├── ExpressServer.js # Main Express server file


## How to Run

1. Clone the repo  
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name

2. npm install -----INSTALLING DEPENDENCIES
3. node ExpressServer.js -------- Run Server


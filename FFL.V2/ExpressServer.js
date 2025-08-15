const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PETS_FILE = path.join(__dirname, 'pets.txt');
const LOGIN_FILE = path.join(__dirname, 'login.txt');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.loggedIn = req.session.user ? true : false;
  next();
});

app.get('/', (req, res) => res.redirect('/QUESTION7'));

app.get('/QUESTION7', (req, res) => {
  res.render('QUESTION7', { message: req.query.message || null });
});

app.get('/giveaway', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login?message=' + encodeURIComponent("Please login to give away a pet."));
  }
  res.render('giveaway');
});

app.get('/find', (req, res) => {
  res.render('find', { pets: [] });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login', { message: req.query.message || null });
});

app.get('/catcare', (req, res) => {
  res.render('catcare');
});

app.get('/dogcare', (req, res) => {
  res.render('dogcare');
});

app.get('/contactus', (req, res) => {
  res.render('contactus');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login?message=' + encodeURIComponent("You have been successfully logged out."));
  });
});


app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('register', { message: "Missing credentials." });
  }

  fs.readFile(LOGIN_FILE, 'utf8', (err, data) => {
    if (err) return res.render('register', { message: "Error reading login file." });

    const existing = data.split('\n').map(line => line.trim().split(':')[0]);
    if (existing.includes(username)) {
      return res.render('register', { message: "That username is already taken. Please choose another." });
    }

    fs.appendFile(LOGIN_FILE, `${username}:${password}\n`, (err) => {
      if (err) return res.render('register', { message: "Error saving user." });
      res.render('register', { message: "Account successfully created! You are now ready to login." });
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  fs.readFile(LOGIN_FILE, 'utf8', (err, data) => {
    if (err) return res.render('login', { message: "Error reading login file." });
    const lines = data.split('\n').map(line => line.trim());
    const validUser = lines.includes(`${username}:${password}`);
    if (validUser) {
      req.session.user = username;
      return res.redirect('/QUESTION7?message=' + encodeURIComponent("Login successful!"));
    }
    res.render('login', { message: "Invalid username or password." });
  });
});

app.post('/giveaway', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login?message=' + encodeURIComponent("You must be logged in to submit a pet."));
  }

  const { pet, age, breed, Gender, compatibleWith, comment, name, email } = req.body;
  const username = req.session.user;

  fs.readFile(PETS_FILE, 'utf8', (err, data) => {
    const lines = data ? data.trim().split('\n') : [];
    const nextId = lines.length + 1;

    const compatibility = Array.isArray(compatibleWith)
      ? compatibleWith.join(',')
      : (compatibleWith || '');

    const cleaned = (str) => str.replace(/[\r\n:]/g, ' ').trim();

    const petLine = [
      nextId,
      username,
      pet,
      breed,
      age,
      Gender,
      compatibility,
      cleaned(comment),
      cleaned(name),
      cleaned(email)
    ].join(':');

    fs.appendFile(PETS_FILE, petLine + '\n', (err) => {
      if (err) {
        console.error('Error writing to pets.txt:', err);
        return res.status(500).send('Something went wrong while saving your pet.');
      }

      res.render('giveaway', {
        loggedIn: true,
        message: "Thank you! Your pet has been listed for adoption.",
      });
    });
  });
});


app.post('/find', (req, res) => {
  const { pet, breed, Gender, compatibleWith } = req.body;

  fs.readFile(PETS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send("Could not load pets.");

    const entries = data.trim().split('\n').filter(Boolean);
    const pets = entries.map(line => {
      const parts = line.split(':');
      const [id, username, petType, breedType, age, gender, compat, comment, owner, email] = parts;
      return {
        id,
        username,
        pet: petType,
        breed: breedType,
        age,
        Gender: gender,
        compatibleWith: compat ? compat.split(',') : [],
        comment,
        name: owner,
        email
      };
    });

    const filtered = pets.filter(p => {
      if (pet && p.pet !== pet) return false;
      if (breed && breed !== "Doesn't Matter" && p.breed !== breed) return false;
      if (Gender && Gender !== "Either" && p.Gender !== Gender) return false;
      if (compatibleWith && compatibleWith.length > 0) {
        const selected = Array.isArray(compatibleWith) ? compatibleWith : [compatibleWith];
        return selected.some(item => p.compatibleWith.includes(item));
      }
      return true;
    });

    res.render('find', { pets: filtered });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

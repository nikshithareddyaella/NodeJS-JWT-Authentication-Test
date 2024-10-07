const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

// CORS headers to allow frontend to communicate with backend
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const secretKey = "My super secret key :):)";
const TOKEN_EXPIRATION_TIME = 3 * 60; // 3 minutes

// JWT middleware
const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ['HS256'],
});

// Hardcoded users
let users = [
  { id: 1, username: 'nikshitha reddy', password: '123' },
  { id: 2, username: 'aella', password: '456' }
];

// Generate JWT Token
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: TOKEN_EXPIRATION_TIME });
}

// Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  for (let user of users) {
    if (username === user.username && password === user.password) {
      let token = generateToken(user);
      return res.json({
        success: true,
        err: null,
        token,
      });
    }
  }

  res.status(401).json({
    success: false,
    token: null,
    err: 'Username or password is incorrect',
  });
});

// Middleware to refresh token on every valid request
app.use('/api', jwtMW, (req, res, next) => {
  const user = users.find((u) => u.id === req.auth.id);
  if (user) {
    const newToken = generateToken(user);
    res.setHeader('Authorization', `Bearer ${newToken}`);
  }
  next();
});

// Dashboard Route
app.get('/api/dashboard', (req, res) => {
  res.json({
    success: true,
    myContent: "Secret Content for logged in users!",
  });
});

// Settings Route
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    myContent: "Settings page content for logged in users!",
  });
});

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling for unauthorized requests
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      err: "JWT token is expired or invalid",
    });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

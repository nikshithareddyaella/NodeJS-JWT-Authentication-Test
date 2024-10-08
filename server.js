const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;
//can also use process.env. environment variables
const secretKey = "My super secret key :):)";
// Set up JWT middleware
const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ['HS256'],
});
// Dummy users(hard corded)
let users = [
  { id: 1, username: 'nikshitha reddy', password: '123' },
  { id: 2, username: 'aella', password: '456' }
];
// Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    for (let user of users) {
      if (username === user.username && password === user.password) {
        // Set token expiration to 3 minutes
        let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
        return res.json({
          success: true,
          err: null,
          token,
        });
      }
    }
  
    // If no matching user is found
    res.status(401).json({
      success: false,
      token: null,
      err: 'Username or password is incorrect',
    });
  });
// Protected Dashboard Route
app.get('/api/dashboard', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Secret Content for logged in users!",
  });
});
app.get("/api/prices", jwtMW, (req,res)=>{
    res.json({
        success:true,
        myContent:"This is price $3.99 ;);)"
    });
});
// Protected Settings Route
app.get('/api/settings', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Settings page content for logged in users!",
  });
});
// Serve index.html on root
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
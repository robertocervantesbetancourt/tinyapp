//required libraries
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

//important variables
const app =express();
const PORT = 8080;

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//view engine
app.set('view engine', 'ejs');

//tinyapp URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//users database
const users = {
  "userRandomID":{
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//Generate a random 6 character string to be used as tiny url
const generateRandomString = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = '';
  for (let x = 0; x <= 6; x++){
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return(newString);
};


///GET

app.get('/', (req, res) => {
  res.redirect(302, "/urls");
});

app.get('/urls', (req, res)=>{
  const templateVars ={username : req.cookies['username'], urls : urlDatabase};
  res.render('urls_index', templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.url.slice(3)]
  res.redirect(302, longURL)
})

app.get('/urls/new', (req, res) => {
  const templateVars = {username : req.cookies['username']}
  res.render('urls_new', templateVars);
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {username : req.cookies['username'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
})

app.get('/register', (req,res) => {
  const templateVars = {username : req.cookies['username']};
  res.render('urls_registration', templateVars);
});

///POST 

app.post('/urls', (req, res) => {
  let tempShort = generateRandomString()
  urlDatabase[tempShort]= `http://${req.body.longURL}`;
  res.redirect(302,`urls/${tempShort}`);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.url.slice(6, 12)];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req, res) => {
  let newLongURL = req.url.slice(6,12);
  urlDatabase[newLongURL] = req.body.longURL;
  res.redirect(302, `/urls/${newLongURL}`);
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
});

//login to set cookie
app.post('/login', (req,res) => {
  res.cookie('username', req.body.username)
  res.redirect(302, '/urls')
});

//register new user. For ID will user random number function
app.post('/register', (req, res) => {
  let userID = generateRandomString();
  users[userID] = {id: userID, email: req.body.email, password: req.body.password};
  res.cookie('user_id', userID);
  console.log(users);
  res.redirect(302, "/urls");
})

//server listening
app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}`)
});
//required libraries
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require ('bcryptjs');
const [generateRandomString, emailCheck, passwordCheck, urlsForUser] = require('./helpers');


//important variables
const app =express();
const PORT = 8080;

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['hola-vida-adios']
}))

//view engine
app.set('view engine', 'ejs');

//tinyapp URL database
const urlDatabase = {
  "b2xVn2":{
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK":{ 
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
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

///GET


//If user is logged in redirect to /urls if not redirect to /login
app.get('/', (req, res) => {
  if (req.session.user_id !== undefined){
    res.redirect(302, "/urls"); 
  } else {
    res.redirect(302, "/login");
  }
});

//If there is no cookie or the cookie is not in the database redirect to /login, else display urls_index page
app.get('/urls', (req, res)=>{
  if (req.session.user_id === undefined || !users.hasOwnProperty(req.session.user_id)){
    res.redirect(302, "/login");
  } else {
      const templateVars ={userid : req.session.user_id, user : users, urls : urlDatabase, userURLS : urlsForUser(req.session.user_id, urlDatabase)};
      res.render('urls_index', templateVars);
  }
})

//Redirect short url to long url page, if short url is not in database then return 400 error
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase.hasOwnProperty(req.url.slice(3))){
    let longURL = urlDatabase[req.url.slice(3)]['longURL']
    res.redirect(302, longURL)
  } else {
    res.status(400).send('Error 400: Short id does not exist');
  }
})

//If logged in user is the onwer of the short URL display urls_new page, if not, redirect to /login
app.get('/urls/new', (req, res) => {
  if(users.hasOwnProperty(req.session.user_id)){
    const templateVars = {userid : req.session.user_id ,user : users}
    res.render('urls_new', templateVars);
  } else {
    res.redirect(302, "/login")
  }
})

//If logged in user is the onwer of the short URL display urls_show page, if not, redirect to /login
app.get('/urls/:shortURL', (req, res) => {
  if(req.session.user_id === urlDatabase[req.params.shortURL]['userID']){
    const templateVars = {userid : req.session.user_id ,user : users, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL']};
    res.render('urls_show', templateVars);
  } else {
    res.redirect(302,"/login");
  }
})

//Display urls_registration when client requests /register
app.get('/register', (req,res) => {
  const templateVars ={userid : req.session.user_id ,user : users, urls : urlDatabase};
  res.render('urls_registration', templateVars);
});


//Display urls_login when client requests /login
app.get('/login', (req,res) => {
  const templateVars ={userid : req.session.user_id ,user : users, urls : urlDatabase};
  res.render('urls_login', templateVars);
});

///POST 

app.post('/urls', (req, res) => {
  //When posting to /urls, if the cookie is not defined display error 403
  if (req.session.user_id === undefined) {
    res.status(403).send('Error 403: Unauthorized to perform action')
  } else {
    let tempShort = generateRandomString()
    //add new short URL, long URL and User id to urlDatabase object. After that redirect to urls/shortURL
    urlDatabase[tempShort] = {};
    urlDatabase[tempShort]['longURL']= `http://${req.body.longURL}`;
    urlDatabase[tempShort]['userID']= users[req.session.user_id]['id'];
    const usercookie = req.session.user_id;
    const userID = users[usercookie]['id']
    res.redirect(302,`urls/${tempShort}`);
    }
  })

//When deleting a short URL, check if the user is the onwner of that shortURL, if so allow delete, else send error   
app.post('/urls/:shortURL/delete', (req, res) => { 
  if(req.session.user_id === undefined || users[req.session.user_id]['id'] !== urlDatabase[req.url.slice(6,12)]['userID']){
    res.status(403).send('Error 403: Unauthorized to perform action');
  } else {
    //delete short URL
    delete urlDatabase[req.url.slice(6, 12)];
    res.redirect('/urls');
  }
});


//When eidting a LongURL, check if the user is the onwner of that shortURL, if so allow edit, else send error  
app.post('/urls/:shortURL/edit', (req, res) => {
  console.log(urlDatabase)
  if(req.session.user_id === undefined || users[req.session.user_id]['id'] !== urlDatabase[req.url.slice(6,12)]['userID']){
    res.status(403).send('Error 403: Unauthorized to perform action');
  } else {
    //push modified long URL and user to urlDatabase object
    let newLongURL = req.url.slice(6,12);
    urlDatabase[newLongURL]['longURL']= req.body.longURL;
    urlDatabase[newLongURL]['userID'] = users[req.session.user_id]['id']
    console.log(urlDatabase)
    res.redirect(302, `/urls/${newLongURL}`);
  }
});

//When loging out delete cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
});

//login to check if email, password and set cookie exist in database
app.post('/login', (req,res) => {
  const email = emailCheck(users, req.body.email);
  const password = passwordCheck(users, email, req.body.password);
    if(email && password){
      req.session.user_id = email
      res.redirect(302, '/urls')
    } else {
      res.status(403).send('Error 403: Incorrect email or password');
    }
  }
);

//register new user. For ID will user random number function
app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === ''){
    res.status(400).send('Error 400: Please fill in email AND password');
  } else if (emailCheck(users, req.body.email) !== false){
    res.status(400).send('Error 400: Email already in use');
  } else {
    let userID = generateRandomString();
    let securePassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = {id: userID, email: req.body.email, password: securePassword};
    req.session.user_id = userID;
    res.redirect(302, "/urls");
  }
})

//server listening
app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}`)
});


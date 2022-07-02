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
  "b2xVn2":{
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK":{ 
    longURL: "http://www.google.com"
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

//Generate a random 6 character string to be used as tiny url
const generateRandomString = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = '';
  for (let x = 0; x < 6; x++){
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return(newString);
};

//Function to check if an email is already in use
const emailCheck = function (list, email) {
  for (const id in list) {
    if (list[id]['email'] === email){
      return id;
    } 
  };
  return false;
}

//function to check if password is the same
const passwordCheck = function (list, id, password) {
  if (id === false){
    return false;
  }
  if(list[id]['password'] === password){
      return true;
  } else {
  return false;
    };
}


///GET

app.get('/', (req, res) => {
  res.redirect(302, "/urls");
});

app.get('/urls', (req, res)=>{
  const templateVars ={userid : req.cookies['user_id'], user : users, urls : urlDatabase};
  res.render('urls_index', templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase.hasOwnProperty(req.url.slice(3))){
    let longURL = urlDatabase[req.url.slice(3)]['longURL']
    res.redirect(302, longURL)
  } else {
    res.status(400).send('Error 400: Short id does not exist');
  }
})

app.get('/urls/new', (req, res) => {
  if(users.hasOwnProperty(req.cookies['user_id'])){
    const templateVars = {userid : req.cookies['user_id'] ,user : users}
    res.render('urls_new', templateVars);
  } else {
    res.redirect(302, "/login")
  }
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {userid : req.cookies['user_id'] ,user : users, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL']};
  res.render('urls_show', templateVars);
})

app.get('/register', (req,res) => {
  const templateVars ={userid : req.cookies['user_id'] ,user : users, urls : urlDatabase};
  res.render('urls_registration', templateVars);
});

app.get('/login', (req,res) => {
  const templateVars ={userid : req.cookies['user_id'] ,user : users, urls : urlDatabase};
  res.render('urls_login', templateVars);
});

///POST 

app.post('/urls', (req, res) => {
  if (req.cookies['user_id'] === undefined) {
    res.status(403).send('Error 401: Unauthorized to perform action')
  } else {
    let tempShort = generateRandomString()
    urlDatabase[tempShort] = {};
    urlDatabase[tempShort]['longURL']= `http://${req.body.longURL}`;
    urlDatabase[tempShort]['userID']= users[req.cookies['user_id']]['id'];
    const usercookie = req.cookies['user_id'];
    const userID = users[usercookie]['id']
    console.log(usercookie, userID);
    console.log(urlDatabase);
    res.redirect(302,`urls/${tempShort}`);
    }
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
  res.clearCookie('user_id');
  res.redirect('/login')
});

//login to check if email, password and set cookie
app.post('/login', (req,res) => {
  const email = emailCheck(users, req.body.email);
  const password = passwordCheck(users, email, req.body.password);
  if(email && password){
      res.cookie('user_id', email)
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
    users[userID] = {id: userID, email: req.body.email, password: req.body.password};
    res.cookie('user_id', userID);
    res.redirect(302, "/urls");
  }
})

//server listening
app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}`)
});
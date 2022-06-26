const express = require('express');
const app =express();
// let ejs = require('ejs');
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = '';
  for (let x = 0; x <= 6; x++){
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return(newString);
};


//GET

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res)=>{
  const templateVars ={urls : urlDatabase};
  res.render('urls_index', templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.url.slice(3)]
  res.redirect(302, longURL)
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
})

//POST 

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



app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}`)
})
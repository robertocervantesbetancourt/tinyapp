const express = require('express');
const app =express();
let ejs = require('ejs');
const PORT = 8080;
const bodyParser = require("body-parser");

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

app.use(bodyParser.urlencoded({extended: true}));


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res)=>{
  const templateVars ={urls : urlDatabase};
  res.render('urls_index', templateVars);
})

app.post('/urls', (req, res) => {
  console.log(req.body);
  let tempShort = generateRandomString()
  urlDatabase[tempShort]= `http://${req.body.longURL}`;
  res.redirect(302,`urls/${tempShort}`);
})

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.url.slice(3)]
  res.redirect(longURL)
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
})


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.listen(PORT,() => {
  console.log(`Example app listening on port ${PORT}`)
})
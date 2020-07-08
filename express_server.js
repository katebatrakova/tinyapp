const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')

//Set ejs as the view engine
app.set("view engine", "ejs")

//body-parser library converts the request body from a POST request Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

function generateRandomString() {
  return Math.random().toString(36).substr(6);
}

const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//submit via the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// POST request to add urls, save and redirect
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;//save key-value to database
  res.redirect(`urls/${shortURL}`)
});

//redirect to LongURL 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
  console.log('redirecting to....', urlDatabase[shortURL]);
});

// DELETE  
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


//Page http://localhost:8080/urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// EDIT in ShortURL
app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.longURL;
  urlDatabase[shortURL] = updatedURL;
  // console.log(urlDatabase); //updated urlDatabase
  res.redirect('/urls');
});

//LOGIN
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  console.log(req.cookies, ' cookies');
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});


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
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//submit via the form
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
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
// EDIT in ShortURL
app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.longURL;
  urlDatabase[shortURL] = updatedURL;
  res.redirect('/urls');
});

//EDIT redirect
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  res.redirect(`/urls/${shortURL}`);
});




//Page http://localhost:8080/urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


//LOGIN and set a COOCKIE named username
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);// set the cookie's key and value
  // console.log(req.cookies, ' cookies'); 
  res.redirect('/urls');
  console.log('Login happenes')
})

//LOGOUT and delete cookie named username
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  // console.log(req.cookies, ' cookies');
  res.redirect('/urls');
  console.log('Logout happenes')
})


app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});


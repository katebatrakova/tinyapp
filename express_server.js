const express = require("express");
const app = express();
const PORT = 8080;

//Set ejs as the view engine
app.set("view engine", "ejs")

//body-parser library converts the request body from a POST request Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).substr(6);
}


const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};



//GET a specific id :shortURL
// app.get("/u/:shortURL", (req, res) => {
//   // const longURL = urlDatabase[req.params.shortURL];
//   // const shortURL = req.params.shortURL;
//   // res.redirect(urlDatabase[shortURL]);
//   console.log(req.params); //doesn't work
//   res.render('urls_show');
// });


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

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

////add  endpoint
app.get("/", (req, res) => {
  res.send("Hello!");
});

//add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//response can contain HTML code rendered in the client browser










app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const express = require("express");
const bcrypt = require("bcrypt");
const findUserByEmail = require("./helpers.js");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const saltRounds = 10;
//Set ejs as the view engine
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//body-parser library converts the request body from a POST request Buffer into string
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

//Middleware creates a session cookie, a unique id, to identify the http client
app.use((req, res, next) => {
  req.currentUser = users[req.session['user_id']];
  next();
});

// ----------------------------------------------------DATABBASE OF URL

const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: 'kate' },
  'b3321': { longURL: "http://www.pumphouse.ca", userID: 'kate' },
  '9sm5xK': { longURL: "http://www.google.com", userID: 'mike' },
  '6u9hm78': { longURL: "http://www.udemy.com", userID: "wt33fjg" },
  'jiwj80r': { longURL: "https://codepen.io", userID: "wt33fjg" },
  'maext6': { longURL: "http://www.udey.com", userID: "wt33fjg" }
};

// ----------------------------------------------------DATABBASE OF USERS
const users = {
  "12": {
    id: "12",
    email: "odin@example.com",
    password: bcrypt.hashSync("first", saltRounds)
  },
  "12we": {
    id: "12we",
    email: "dva@example.com",
    password: bcrypt.hashSync("second", saltRounds)
  },
  "kk90l": {
    id: "kk90l",
    email: "katerynabatrakova@gmail.com",
    password: bcrypt.hashSync("rty", saltRounds)
  },
  "mm121": {
    id: "mm121",
    email: "mykhailobatrakov@gmail.com",
    password: bcrypt.hashSync("ytr", saltRounds)
  },
  "klkl": {
    id: "klkl",
    email: "kate@mail.com",
    password: bcrypt.hashSync("111", saltRounds)
  },
  "brbrbr": {
    id: "brbrbr",
    email: "brad@mail.com",
    password: bcrypt.hashSync("222", saltRounds)
  }
};

// this end point is for checking the content of usersDb
// remove when cleaning up the code
app.get('/users', (req, res) => {
  res.json(users);
});
app.get('/urldatabase', (req, res) => {
  res.json(urlDatabase);
});
// ----------------------------------------------------HELPER FUNCTIONS

function generateRandomString() {
  return Math.random().toString(36).substr(6);
}

const addNewUSer = (userId, email, password, users) => {
  //create a new user object which is the value associated with the ID
  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  };
  //add new user object to usersDB
  users[userId] = newUser;
  return userId;
};

//retrieve urls assiciated with the specific user

const urlsForUser = function (userID) {
  const usersLongUrls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      usersLongUrls[id] = (urlDatabase[id].longURL);
    }
  }
  return usersLongUrls;
};

const authenticateUser = (email, password, users) => {
  //check if the user with that email exist
  const user = findUserByEmail(email, users);
  //check the email and password match
  if (user && bcrypt.compareSync(password, user.password) && user.email === email) {
    return user.id;
  } else {
    return false;
  }
};

//check if shortURL belongs to userId

const urlsOfUser = function (userID, shortURL) {
  let belongsToUser = false;
  for (let objectKey of Object.keys(urlDatabase)) {
    if (objectKey === shortURL && urlDatabase[objectKey].userID === userID) {
      belongsToUser = true;
    }
  }
  return belongsToUser;
};

//check if longURL already exists for the user

const longUrlOfUser = function (userID, longURL) {
  let urlExists = true;
  for (let objectValue of Object.values(urlDatabase)) {
    if (objectValue.longURL === longURL && objectValue.userID === userID) {
      return urlExists;
    }
  }
  return false;
};

const findUserByUserId = userId => {
  //loop through the users
  for (let keyUserId in users) {
    // if user match retrieve the user
    if (users[keyUserId].id === userId) {
      return true;
    }
  }
  return false;
};
// ----------------------------------------------------MAIN PAGE

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    const usersUrls = urlsForUser(user_id);
    let templateVars = { user_id: users[user_id], urls: urlDatabase, usersUrls: usersUrls, email: users[user_id].email };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars);
  }
});

// ----------------------------------------------------Display NEW PAGE form

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id !== null) {
    let templateVars = { user_id: users[user_id], email: users[user_id].email };
    res.render("urls_new", templateVars);
  }
  if (req.currentUser === undefined) {
    res.redirect('/login');
  }
});

// ----------------------------------------------------POST NEW url, save and redirect

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const urlExists = longUrlOfUser(user_id, longURL, urlDatabase);  //function that checks if email already in database
  if (!urlExists) {
    urlDatabase[shortURL] = { longURL: longURL, userID: user_id };//save key-value to database
    res.redirect(`/urls/${shortURL}`);
  } else {
    let templateVars = { user_id: user_id, urls: urlDatabase, email: users[user_id].email };
    res.render('emailExists', templateVars);
  }
});

// ----------------------------------------------------Page urls/:shortURL

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  //check if shortURL belong to the user
  const urlBelongsToUser = urlsOfUser(user_id, shortURL, urlDatabase);
  // check if the user is registered
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    if (urlBelongsToUser) {
      const usersUrls = urlsForUser(user_id);
      let templateVars = { user_id: users[user_id], urls: urlDatabase, usersUrls: usersUrls, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: users[user_id].email };
      res.render("urls_show", templateVars);
    } else {
      let templateVars = { user_id: users[user_id], urls: urlDatabase, email: users[user_id].email };
      res.render('urlNotBelongs', templateVars);
    }
  } else {
    //prompt to login or register
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars);
  }
});


// ----------------------------------------------------redirect to LongURL

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] !== undefined) {
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.status(404).send("Sorry, the website is not found");
  }
});

// ----------------------------------------------------DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  // check if shortURL belong to the user
  const urlBelongsToUser = urlsOfUser(user_id, shortURL);
  // check if the user is registered
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    if (urlBelongsToUser) {
      delete urlDatabase[shortURL];
    } else {
      let templateVars = { user_id: users[user_id], urls: urlDatabase, email: users[user_id].email };
      res.render('urlNotBelongs', templateVars);
    }
  } else {
    //prompt to login or register
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars);
  }

  res.redirect('/urls');
});

// ----------------------------------------------------EDIT in ShortURL

app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.longURL;
  const user_id = req.session.user_id;
  //check if shortURL belongs to the user
  const urlBelongsToUser = urlsOfUser(user_id, shortURL);
  console.log(urlBelongsToUser, 'short url belongs to user?')
  // check if the user is registered 
  const registeredUser = findUserByUserId(user_id);
  console.log(registeredUser, 'user is registeredUser?')
  if (registeredUser) {
    if (urlBelongsToUser) {
      urlDatabase[shortURL] = { longURL: updatedURL, userID: user_id };
    } else {
      let templateVars = { user_id: users[user_id], urls: urlDatabase, email: users[user_id].email };
      res.render('urlNotBelongs', templateVars);
    }
  } else {
    //prompt to login or register
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars);
  }
  res.redirect('/urls');
});

// ----------------------------------------------------display REGISTER form

app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) res.redirect('/urls'); //redirect users who are logged in
  let templateVars = { user_id: users[user_id] };
  res.render('register', templateVars);
});

// ---------------------------------------------------- REGISTER form SUBMIT

app.post('/register', (req, res) => {
  //extract user info from the form
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // Check if user already exist
  const userExists = findUserByEmail(email, users);
  if (!userExists) {
    //add user to the users DB function
    const userID = addNewUSer(userId, email, password, users);
    //set and encrypt the user id in the cookie
    req.session.user_id = userID;
    res.redirect('/urls');
  } else { // in case the user exists in the system
    const user_id = req.session.user_id;
    let templateVars = { user_id: users[user_id] };
    res.render('registrationFailed', templateVars);
  }
});

// ----------------------------------------------------Display LOGIN PAGE

app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) res.redirect('/urls');
  let templateVars = { user_id: users[user_id] };
  res.render('login', templateVars);
});

// ----------------------------------------------------LOGIN form submit

app.post('/login', (req, res) => {
  //extract the user info from the request body
  const email = req.body.email;
  const password = req.body.password;
  const user_id = req.session.user_id;
  //authenticate user
  const userId = authenticateUser(email, password, users);
  if (userId) {
    // set and encrypt the user ID in the coockie
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    let templateVars = { user_id: users[user_id] };
    res.render('authenticationFailed', templateVars);
  }
});

// ----------------------------------------------------LOGOUT

app.post("/logout", (req, res) => {
  req.session['user_id'] = null; //delete the cookie
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});










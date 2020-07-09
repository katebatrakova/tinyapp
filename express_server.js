const express = require("express");
const bcrypt = require("bcrypt");
const findUserByEmail = require("./helpers.js");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session')
const saltRounds = 10;
//Set ejs as the view engine
app.set("view engine", "ejs")

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//body-parser library converts the request body from a POST request Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// add app middleware  so you can access it anywhere 
app.use((req, res, next) => {
  req.currentUser = users[req.session['user_id']]
  next();
})

// ----------------------------------DATABBASE OF URLs
const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: 'kate' },
  'b3321': { longURL: "http://www.pumphouse.ca", userID: 'kate' },
  '9sm5xK': { longURL: "http://www.google.com", userID: 'mike' },
  '6u9hm78': { longURL: "http://www.udemy.com", userID: "wt33fjg" },
  'jiwj80r': { longURL: "https://codepen.io", userID: "wt33fjg" },
  'maext6': { longURL: "http://www.udey.com", userID: "wt33fjg" }
};

// ----------------------------------DATABBASE OF USERS

const users = {
  "asdf": {
    id: "asdf",
    email: "odin@example.com",
    password: bcrypt.hashSync("first", saltRounds)
  },
  "qwerty": {
    id: "qwerty",
    email: "dva@example.com",
    password: bcrypt.hashSync("second", saltRounds)
  },
  "kate": {
    id: "kate",
    email: "katerynabatrakova@gmail.com",
    password: bcrypt.hashSync("rty", saltRounds)
  },
  "mike": {
    id: "mike",
    email: "mykhailobatrakov@gmail.com",
    password: bcrypt.hashSync("ytr", saltRounds)
  }
}

//--------------------------------------------HELPER FUNCTIONS 

function generateRandomString() {
  return Math.random().toString(36).substr(6);
};

const addNewUSer = (userId, email, password, users) => {
  //create a new user object which is the value associated with the ID
  const newUser = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, saltRounds)
  }
  //add new user object to usersDB
  users[userId] = newUser;
  //return userID
  return userId;
}

const urlsForUser = function (userID) {
  const usersLongUrls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      usersLongUrls[id] = (urlDatabase[id].longURL)
    }
  }
  return usersLongUrls;
}

const authenticateUser = (email, password, users) => {
  //does the user with that email exist
  const user = findUserByEmail(email, users);
  //check the email and password match
  if (user && bcrypt.compareSync(password, user.password) && user.email === email) {
    return user.id;
  } else {
    return false;
  }
}
//loop through urlsDatabase urls to see if short id belongs to userId
const urlsOfUser = function (userID, shortURL, urlDatabase) {
  let belongsToUser = false;
  for (let objectKey of Object.keys(urlDatabase)) {
    if (objectKey === shortURL && urlDatabase[objectKey].userID === userID) {
      belongsToUser = true;
    }
  }
  return belongsToUser;
}
//loop through urlsDatabase urls to see if LongURL already exists for the user
const longUrlOfUser = function (userID, longURL, urlDatabase) {
  let urlExists = true;;
  for (let objectValue of Object.values(urlDatabase)) {
    if (objectValue.longURL === longURL && objectValue.userID === userID) {
      return urlExists;
    }
  }
  return false;
}


const findUserByUserId = userId => {
  //loop through the users
  for (let keyUserId in users) {
    // if user match retrieve the user
    if (users[keyUserId].id === userId) {
      return true;
    }
  }
  return false;
}

const checkURLinDatabase = ((longURL) => {
  for (let id in urlDatabase) {
    if (urlDatabase[id].longURL === longURL) {
      return true;
    };
  }
  return false;
})

const checkUserIdUrlDatabase = ((user_id) => {
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === user_id) {
      return true;
    };
  }
  return false;
})
//--------------------------------------------HELPER FUNCTIONS END
// this end point is for checking the content of usersDb
// remove when cleaning up the code
app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/urlDatabase', (req, res) => {
  res.json(urlDatabase);
});

//----------------------------------MAIN PAGE

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  console.log(user_id, 'user id')
  if (user_id === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});
//----------------------------------MAIN PAGE

app.get("/urls", (req, res) => {
  console.log(req.currentUser, 'current user')
  const user_id = req.session.user_id;
  const userIdUrlDatabaseExists = checkUserIdUrlDatabase(user_id);
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    const usersUrls = urlsForUser(user_id);
    let templateVars = { user_id: users[user_id], urls: urlDatabase, usersUrls: usersUrls, email: users[user_id].email };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars)
  }
});

//----------------------------------Display NEW PAGE form
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { user_id: users[user_id], email: users[user_id].email }
  console.log(user_id, 'user id in new')
  if (user_id !== null) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//----------------------------------POST request to add urls, save and redirect
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const urlExists = longUrlOfUser(user_id, longURL, urlDatabase);  //function that checks if email already in database

  if (!urlExists) {
    console.log(shortURL, 'short URL generated')
    urlDatabase[shortURL] = { longURL: longURL, userID: user_id };//save key-value to database
    res.redirect(`/urls/${shortURL}`)
  } else {
    let templateVars = { user_id: user_id, urls: urlDatabase, email: users[user_id].email }
    res.render('emailExists', templateVars)
    console.log(templateVars, ' for posting new existing url')
  }
  // console.log(urlDatabase, 'updated database url')
});

//----------------------------------Page urls/:shortURL

app.get("/urls/:shortURL", (req, res) => {
  ///urls/:id page should display a message or prompt if the user is not logged in
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const urlBelongsToUser = urlsOfUser(user_id, shortURL, urlDatabase)
  console.log(urlBelongsToUser, ' belongs to user');
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    if (urlBelongsToUser) {
      const usersUrls = urlsForUser(user_id);
      let templateVars = { user_id: users[user_id], urls: urlDatabase, usersUrls: usersUrls, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, email: users[user_id].email };
      res.render("urls_show", templateVars);
    } else {
      let templateVars = { user_id: users[user_id], urls: urlDatabase, email: users[user_id].email };
      res.render('urlNotBelongs', templateVars)
    }
  } else {
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars)
  }
});


// //----------------------------------redirect to LongURL 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] !== undefined) {
    res.redirect(urlDatabase[shortURL].longURL);
    console.log('redirecting to....', urlDatabase[shortURL].longURL);
  } else {
    res.status(404).send("Sorry, the website is not found");
  }

});

// ----------------------------------DELETE  

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// ----------------------------------EDIT in ShortURL
app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL = req.body.longURL;
  const user_id = req.session.user_id;
  urlDatabase[shortURL] = { longURL: updatedURL, userID: user_id }
  console.log(urlDatabase)
  res.redirect('/urls');

});

//----------------------------------display REGISTER page to the user
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) res.redirect('/urls');
  let templateVars = { user_id: users[user_id] }
  res.render('register', templateVars);
})

// ----------------------------------catch the submit btn of the REGISTER form, set COOCKIE
app.post('/register', (req, res) => {
  //extract user info from the form
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // Check if user already exist via function 
  const userExists = findUserByEmail(email, users);
  if (!userExists) {
    //add user to the users DB function
    const userID = addNewUSer(userId, email, password, users);
    //set the user id in the cookie 
    req.session.user_id = userID;
    console.log(userID, 'this is a userID')
    res.redirect('/urls');
  }
  else {
    const user_id = req.session.user_id;
    let templateVars = { user_id: users[user_id] }
    res.render('registrationFailed', templateVars)
  }
  console.log(users, 'updates users object database');
})

// -----------------------Display LOGIN PAGE
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) res.redirect('/urls');
  let templateVars = { user_id: users[user_id] }
  res.render('login', templateVars);
});

// ------------------------- LOGIN the user 

app.post('/login', (req, res) => {
  //extract the user info from the request body
  const email = req.body.email;
  const password = req.body.password;
  const user_id = req.session.user_id;
  console.log(user_id, 'cookie on login')
  //authenticate user
  const userId = authenticateUser(email, password, users);
  console.log(userId);
  if (userId) {
    // set the user ID in the coockie
    req.session.user_id = userId;
    console.log(userId, ' ------ user ID');
    console.log(req.session.user_id, ' -------user id in cookie');
    res.redirect('/urls');
  } else {
    let templateVars = { user_id: users[user_id] }
    res.render('authenticationFailed', templateVars);
  }
})

//---------------------------------LOGOUT 
app.post("/logout", (req, res) => {
  req.session['user_id'] = null; //delete the cookie
  res.redirect('/urls');
  console.log('Logout happenes')
  console.log(req.session.user_id, ' -------user id in cookie');
})

app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});










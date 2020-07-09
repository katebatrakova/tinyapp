const express = require("express");
const bcrypt = require("bcrypt");
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
//--------------------------------------------HELPER FUNCTIONS
function generateRandomString() {
  return Math.random().toString(36).substr(6);
};

const findUserByEmail = email => {
  //loop through the users
  for (let keyUserId in users) {
    //if user match retrieve the user
    if (users[keyUserId].email === email) {
      return users[keyUserId];
    }
  }
  return false;
}




const addNewUSer = (userId, email, password) => {
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


const authenticateUser = (email, password) => {
  //does the user with that email exist
  const user = findUserByEmail(email);
  //check the email and password match
  if (user && bcrypt.compareSync(password, user.password) && user.email === email) {
    return user.id;
  } else {
    return false;
  }
}



// ----------------------------------DATABBASE OF URLs
const urlDatabase = {
  'b2xVn2': { longURL: "http://www.lighthouselabs.ca", userID: 'kate' },
  'b3321': { longURL: "http://www.pumphouse.ca", userID: 'kate' },
  '9sm5xK': { longURL: "http://www.google.com", userID: 'mike' },
  '6u9hm78': { longURL: "http://www.udemy.com", userID: "wt33fjg" },
  'jiwj80r': { longURL: "https://codepen.io", userID: "wt33fjg" },
  'maext6': { longURL: "http://www.udey.com", userID: "wt33fjg" }
};

const urlsForUser = function (userID) {
  const usersLongUrls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      usersLongUrls[id] = (urlDatabase[id].longURL)
    }
  }
  return usersLongUrls;
}
//loop through urlsDatabase urls to see if short id belong to userId

const urlsOfUser = function (userID, shortURL) {
  let belongsToUser = false;
  for (let objectKey of Object.keys(urlDatabase)) {
    if (objectKey === shortURL && urlDatabase[objectKey].userID === userID) {
      belongsToUser = true;
    }
  }
  return belongsToUser;
}

// console.log(urlsOfUser('kate', 'b3321'));




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

// this end point is for checking the content of usersDb
// remove when cleaning up the code
app.get('/users', (req, res) => {
  res.json(users);
});

app.get('/urlDatabase', (req, res) => {
  res.json(urlDatabase);
});

const findUserByUserId = userId => {
  //loop through the users
  for (let keyUserId in users) {
    // if user match retrieve the user
    if (users[keyUserId].id === userId) {
      // console.log(users[keyUserId].id, userId, 'users match')
      return true;
    }
  }
  return false;
}

//--------------------------------------------HELPER FUNCTIONS 

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

//----------------------------------MAIN PAGE
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userIdUrlDatabaseExists = checkUserIdUrlDatabase(user_id);
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    const usersUrls = urlsForUser(user_id);
    let templateVars = { user_id: users[user_id], urls: urlDatabase, usersUrls: usersUrls };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { user_id: users[user_id], urls: urlDatabase };
    res.render('urls_login_register', templateVars)
  }
});


//----------------------------------Display NEW PAGE
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = { user_id: users[user_id] }
  if (user_id !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.render('urls_login_register', templateVars)
  }
});

//----------------------------------POST request to add urls, save and redirect
app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  // console.log(user_id, 'user id of the one who posts ')
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const urlExists = checkURLinDatabase(longURL);  //function that checks if email already in database
  if (!urlExists) {
    console.log(shortURL, 'short URL generated')
    urlDatabase[shortURL] = { longURL: longURL, userID: user_id };//save key-value to database
    res.redirect(`/urls/${shortURL}`)
  } else {
    res.status(404).send("Sorry, the email you are trying to submit to submit exists");
  }
  // console.log(urlDatabase, 'updated database url')
});

//----------------------------------Page urls/:shortURL

app.get("/urls/:shortURL", (req, res) => {
  ///urls/:id page should display a message or prompt if the user is not logged in
  const user_id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const urlBelongsToUser = urlsOfUser(user_id, shortURL)
  console.log(urlBelongsToUser, ' belongs to user');
  const registeredUser = findUserByUserId(user_id);
  if (registeredUser) {
    if (urlBelongsToUser) {
      const usersUrls = urlsForUser(user_id);
      let templateVars = { user_id: users[user_id], urls: urlDatabase, usersUrls: usersUrls, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
      res.render("urls_show", templateVars);
    } else {
      let templateVars = { user_id: users[user_id], urls: urlDatabase };
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
  const userExists = findUserByEmail(email);
  if (!userExists) {
    //add user to the users DB function
    const userID = addNewUSer(userId, email, password);
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
  let templateVars = { user_id: users[user_id] }
  res.render('login', templateVars);
});

// ------------------------- LOGIN the user 

app.post('/login', (req, res) => {
  //extract the user info from the request body
  const email = req.body.email;
  const password = req.body.password;
  const user_id = req.session.user_id;
  //authenticate user
  const userId = authenticateUser(email, password);
  if (userId) {
    //   // set the user ID in the coockie
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



//  LECTURE SECURITY

// '/users' endpoint - database 


// added to password in users db//:bcrypt.hashSync(password,saltRounds) need to comment out




//for login we need to change the m,echanism; we need plaint text


// added bcrypt.compareSync(password, user.password) to authenticate function bcrypt.compareSync(password, user.password) === password


// In addNEw USer function, if want to change users IDS to not random but incremental
// change in function addNewUser = Object.keys(users).length +1


// use filter function on users const users = Object.values(users)



// to encrypt  cookies disable cookie parser
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1', 'key2']
// }))
// in /urls add
// set everywhere where set coockie
// req.session['user_id'] = userId
// disable req.cookie everywhere and where we assign userID const userId =req.session['user.id]
// to clear cookie in logout res.session['user_id'] = null;
// 

//to secure traffic and ecrypt all the data httpS


// add app middleware  so you can access it anywhere 

// app.arguments((req, res, next) {
//   req.current User = users[req.session['user_id']]
//   next()
// })





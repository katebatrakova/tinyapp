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


// ----------------------------------DATABBASE OF URLs
const urlDatabase = {
  'b2xVn2': "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};
// ----------------------------------DATABBASE OF USERS

const users = {
  "asdf": {
    id: "asdf",
    email: "odin@example.com",
    password: "first"
  },
  "qwerty": {
    id: "qwerty",
    email: "dva@example.com",
    password: "second"
  }
}
//----------------------------------MAIN PAGE
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars = { user_id: users[user_id], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//----------------------------------POST request to add urls, save and redirect
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;//save key-value to database
  res.redirect(`urls/${shortURL}`)
});


//----------------------------------redirect to LongURL 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
  console.log('redirecting to....', urlDatabase[shortURL]);
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
  urlDatabase[shortURL] = updatedURL;
  res.redirect('/urls');
});


//----------------------------------EDIT redirect
// app.get("/urls/:shortURL", (req, res) => {
//   const shortURL = req.params.shortURL;
//   console.log(shortURL);
//   res.redirect(`/urls/${shortURL}`);
// });

//----------------------------------Page http://localhost:8080/urls/:shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars = { user_id: users[user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


//----------------------------------LOGIN and set a COOCKIE named username
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);// set the cookie's key and value
  // console.log(req.cookies, ' cookies'); 
  res.redirect('/urls');
  console.log('Login happenes')
})

//----------------------------------LOGOUT and delete cookie named username
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  // console.log(req.cookies, ' cookies');
  res.redirect('/urls');
  console.log('Logout happenes')
})

//----------------------------------SUBMIT NEW via the form
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars = { user_id: users[user_id] }
  res.render("urls_new", templateVars);
});



// LECTURE

//----------------------------------display REGISTER page to the user
app.get('/register', (req, res) => {
  res.render('register');
})

// //----------------------------------function for REGISTER find if user exists 

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

// //----------------------------------function for REGISTER 

const addNewUSer = (userId, email, password) => {

  //create a new user object which is the value associated with the ID
  const newUser = {
    id: userId,
    email,
    password
  }
  //add new user object to usersDB
  users[userId] = newUser;
  //return userID
  return userId;
}

// //----------------------------------catch the submit btn of the REGISTER form, set COOCKIE
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
    //set the user id in the coockie 
    res.cookie('user_id', userID);

    console.log(userID, 'this is a userID')
    res.redirect('/urls');
  }
  // else {
  //   res.status(401).send("Error: email already exists");
  // }
  // console.log(req.cookies['user_id'], 'cookies') //test the new user is appended to users database
  // console.log(users, 'users object') //test the new user is appended to users database
})

// //display LOGIN form
// app.length('/login', (req, res) => {
//   res.render('/login');
// });

// //LOGIN the user 

// app.post('/login', (req, res) => {

//   //extract the user info from the request body
//   const username = req.body.username;
//   const password = req.body.password;
//   //authenticate user
//   const userId = authenticateUser(email, password);
//   if (userId) {
//     // set the user ID in the coockie
//     res.cookie('user_id', userId);
//     res.redirect('/urls');
//   } else {
//     res.status(401).send('Wrong credentials')
//   }

// })
// // function authenticate for LOGIN
// const authenticateUser = (email, password) => {
//   //does the user with that email exist
//   const user = findtUSerByEmail(email);
//   //chek the email and password match
//   if (user && user.password === password) {
//     return user.id;
//   } else {
//     return false;
//   }
// }

// after login creation add to /urls hereto template VARS user: users[req.cookies['user_id']]; res.render('/register', templateVArs)
//then change the _header . 

// implement LOGOUT button














app.listen(PORT, () => {
  console.log(`TinyAPP listening on port ${PORT}!`);
});
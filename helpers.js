
const findUserByEmail = (email, users) => {
  //loop through the users
  for (let keyUserId in users) {
    //if user match retrieve the user
    if (users[keyUserId].email === email) {
      return users[keyUserId];
    }
  }
  return undefined;
}










module.exports = findUserByEmail;
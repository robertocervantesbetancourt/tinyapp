const bcrypt = require ('bcryptjs');


//Generate a random 6 character string to be used as tiny url
const generateRandomString = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = '';
  for (let x = 0; x < 6; x++){
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return(newString);
};

//Function to check if an email is already in use
const emailCheck = function (list, email) {
  for (const id in list) {
    if (list[id]['email'] === email){
      return id;
    } 
  };
  return false;
}

//function to check if password is the same
const passwordCheck = function (list, id, password) {
  if (id === false){
    return false;
  }
  if(bcrypt.compareSync(password, list[id]['password'])) {
      return true;
  } else {
  return false;
  };
}

//Function to find all the user URL's
const urlsForUser = function (id, list) {
  let urls = [];
  for (const u in list){
    if(list[u]['userID'] === id){
      urls.push(list[u]['userID'])
    }
  } return urls;
}

module.exports = [generateRandomString, emailCheck, passwordCheck, urlsForUser];
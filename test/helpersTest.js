const { assert } = require('chai');

const [ emailCheck ] = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailCheck', function() {
  it('should return a user with valid email', function() {
    const user = emailCheck(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    assert(user, expectedUserID);
  });
});

describe('emailCheck', function() {
  it('should return FALSE', function() {
    const user = emailCheck(testUsers, "user2@example.com")
    const expectedUserID = false;
    assert(user, expectedUserID);
  });
});
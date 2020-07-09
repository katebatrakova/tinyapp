const assert = require('chai').assert;

const findUserByEmail = require('../helpers.js');

const testUsers = {
  'asdf': {
    id: "asdf",
    email: "odin@example.com",
    password: "$2b$10$HxlJYs/MAw7z3lsyGzZ98OupHsZGtvPl3bUIK1f44iqC//nUrj7uW"
  },
  'qwerty': {
    id: "qwerty",
    email: "dva@example.com",
    password: "$2b$10$K3GpRx1MvzrGmlDnGFP4.e8OykGkwaz/AlO81wnpNtUrhlPZrY2ca"
  },
  'kate': {
    id: "kate",
    email: "katerynabatrakova@gmail.com",
    password: "$2b$10$YOBWx0HzVjZLU9GsK1MO5eugnNXDYl13ugu5lHxHkx5lCG60VP7b."
  },
  'mike': {
    id: "mike",
    email: "myk@gmail.com",
    password: "$2b$10$ykYaKi5XfCKxwUy0GScTVOJc4BjzhFcmmkW1ZTFwpkakAtzNKfqya"
  }
}

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = findUserByEmail("myk@gmail.com", testUsers)
    const expectedOutput = testUsers["mike"];
    assert.strictEqual(user, expectedOutput)
  });
  it('should return a user with valid email', function () {
    const user = findUserByEmail("dva@example.com", testUsers)
    const expectedOutput = testUsers["qwerty"];
    assert.strictEqual(user, expectedOutput)
  });
  it("should return undefined for an email that's not in our database", function () {
    const user = findUserByEmail("red@gmail.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput)
  });
});
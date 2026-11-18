const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check whether the username already exists
const isValid = (username) => {
  return users.filter((user) => user.username === username).length > 0;
};

// Check that username and password match a registered user
const authenticatedUser = (username, password) => {
  return users.filter((user) => user.username === username && user.password === password).length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  }
  return res.status(208).json({ message: "Invalid Login. Check username and password" });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "The review for the book with ISBN " + isbn + " has been added/updated.",
    reviews: books[isbn].reviews
  });
});

// Delete a book review (only the logged in user's own review)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({
    message: "Review for the book with ISBN " + isbn + " posted by " + username + " has been deleted.",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

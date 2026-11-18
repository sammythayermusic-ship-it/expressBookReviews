const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }
  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = {};
  Object.keys(books).forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      result[key] = books[key];
    }
  });
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = {};
  Object.keys(books).forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      result[key] = books[key];
    }
  });
  return res.status(200).send(JSON.stringify(result, null, 4));
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: "Book not found" });
});

// ---- Axios versions of the same lookups (async/await and promise callbacks) ----
const BASE_URL = "http://localhost:5000";

// Get all books using async/await with Axios
const getAllBooks = async () => {
  const response = await axios.get(BASE_URL + "/");
  return response.data;
};

// Get book by ISBN using a Promise with Axios
const getBookByISBN = (isbn) => {
  return axios.get(BASE_URL + "/isbn/" + isbn).then((response) => response.data);
};

// Get books by author using async/await with Axios
const getBooksByAuthor = async (author) => {
  const response = await axios.get(BASE_URL + "/author/" + encodeURIComponent(author));
  return response.data;
};

// Get books by title using a Promise with Axios
const getBooksByTitle = (title) => {
  return axios.get(BASE_URL + "/title/" + encodeURIComponent(title)).then((response) => response.data);
};

public_users.get('/axios/books', async (req, res) => {
  try {
    return res.status(200).json(await getAllBooks());
  } catch (err) {
    return res.status(500).json({ message: "Could not fetch books" });
  }
});

public_users.get('/axios/isbn/:isbn', (req, res) => {
  getBookByISBN(req.params.isbn)
    .then((data) => res.status(200).json(data))
    .catch(() => res.status(404).json({ message: "Book not found" }));
});

public_users.get('/axios/author/:author', async (req, res) => {
  try {
    return res.status(200).json(await getBooksByAuthor(req.params.author));
  } catch (err) {
    return res.status(500).json({ message: "Could not fetch books by author" });
  }
});

public_users.get('/axios/title/:title', (req, res) => {
  getBooksByTitle(req.params.title)
    .then((data) => res.status(200).json(data))
    .catch(() => res.status(500).json({ message: "Could not fetch books by title" }));
});

module.exports.general = public_users;

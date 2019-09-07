const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-book', isAuth, adminController.getAddBook);

// /admin/products => GET
router.get('/books', isAuth, adminController.getBooks);

// /admin/add-product => POST
router.post(
  '/add-book',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
      body('authorName')
      .isString()
      .isLength({ min: 3 })
      .trim(),
      body('publisher')
      .isString()
      .isLength({ min: 3 })
      .trim(),
      body('isbn')
      .isString()
      .isLength({ min: 3 })
      .trim(),
      body('pages')
      .isFloat(),
    body('price').isFloat(),
    body('reviews')
      .isLength({ min: 5, max: 1000 })
      .trim(),
    body('summary')
     .isLength({ min: 5, max: 1000 })
     .trim()
  ],
  isAuth,
  adminController.postAddBook
);

router.get('/edit-book/:bookId', isAuth, adminController.getEditBook);

router.post(
  '/edit-book',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditBook
);

router.post('/delete-book', isAuth, adminController.postDeleteBook);

module.exports = router;

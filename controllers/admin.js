const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Book = require('../models/book');

exports.getAddBook = (req, res, next) => {
  res.render('admin/edit-book', {
    pageTitle: 'Add Book',
    path: '/admin/add-book',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddBook = (req, res, next) => {
  const title = req.body.title;
  const authorName = req.body.authorName;
  const pages = req.body.pages;
  const publisher = req.body.publisher;
  const isbn = req.body.isbn;
  const image = req.file;
  const price = req.body.price;
  const reviews = req.body.reviews;
  const summary = req.body.summary
  if (!image) {
    return res.status(422).render('admin/edit-book', {
      pageTitle: 'Add Book',
      path: '/admin/add-book',
      editing: false,
      hasError: true,
      book: {
        title: title,
        authorName:authorName,
        pages:pages,
        publisher:publisher,
        isbn:isbn,
        price: price,
        reviews: reviews,
        summary: summary
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-book', {
      pageTitle: 'Add Book',
      path: '/admin/add-book',
      editing: false,
      hasError: true,
      book: {
        title: title,
        authorName:authorName,
        pages:pages,
        publisher:publisher,
        isbn:isbn,
        price: price,
        reviews: reviews,
        summary: summary
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const book = new Book({
    // _id: new mongoose.Types.ObjectId('5badf72403fd8b5be0366e81'),
    title: title,
    price: price,
    authorName:authorName,
    pages:pages,
    publisher:publisher,
    isbn:isbn,
    reviews: reviews,
    summary: summary,
    imageUrl: imageUrl,
    userId: req.user
  });
  book
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Book');
      res.redirect('/admin/books');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditBook = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.bookId;
  Book.findById(prodId)
    .then(book => {
      if (!book) {
        return res.redirect('/');
      }
      res.render('admin/edit-book', {
        pageTitle: 'Edit Book',
        path: '/admin/edit-book',
        editing: editMode,
        book: book,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditBook = (req, res, next) => {
  const prodId = req.body.bookId;
  const updatedTitle = req.body.title;
  const updatedAuthorName = req.body.authorName;
  const updatedPages = req.body.pages;
  const updatedPublisher = req.body.publisher
  const updatedISBN = req.body.isbn
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedReviews= req.body.reviews;
  const updatedSummary= req.body.summary;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-book', {
      pageTitle: 'Edit Book',
      path: '/admin/edit-book',
      editing: true,
      hasError: true,
      book: {
        title: updatedTitle,
        authorName:updatedAuthorName,
        publisher: updatedPublisher,
        pages: updatedPages,
        isbn:updatedISBN,
        price: updatedPrice,
        reviews: updatedReviews,
        summary: updatedSummary,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Book.findById(prodId)
    .then(book => {
      if (book.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      book.title = updatedTitle;
      book.authorName = updatedAuthorName;
      book.publisher = updatedPublisher;
      book.pages = updatedPages;
      book.isbn = updatedISBN
      book.price = updatedPrice;
      book.reviews= updatedReviews;
      book.summary= updatedSummary;

      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        book.imageUrl = image.path;
      }
      return book.save().then(result => {
        console.log('UPDATED BOOK!');
        res.redirect('/admin/books');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBooks = (req, res, next) => {
  Book.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(books => {
      console.log(books);
      res.render('admin/books', {
        prods: books,
        pageTitle: 'Admin Books',
        path: '/admin/books'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteBook = (req, res, next) => {
  const prodId = req.body.bookId;
  Book.findById(prodId)
    .then(book => {
      if (!book) {
        return next(new Error('Book not found.'));
      }
      fileHelper.deleteFile(book.imageUrl);
      return Book.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED BOOK');
      res.redirect('/admin/books');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

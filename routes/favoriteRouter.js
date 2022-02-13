const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');

const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser,(req, res, next) => {
  Favorite.find({ user: req.user._id })
  .populate('user')
  .populate('campsites')
  .then(favorites => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(favorites);
  })
  .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({user:req.user._id})
  .then(favorite => {
    if (favorite) {
      req.body.forEach(x => {
        const xx = Object.values(x)
        console.log(xx)
        if (favorite.campsites.includes(xx)) {
          favorite.campsites.push(xx)
        } else {
          return;
        }
      })
    } else {
      Favorite.create({user:req.user._id})
      .then(favorite => {
        favorite.campsites.push(req.body);
        favorite.save()
        .then(favorite => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        })
      })

    }
  })
  .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOneAndDelete({ user: req.user._id })
  .then(response => {
    if (Favorite) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response)
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.end('You do not have any favorites to delete')
    }
  })
  .catch(err => next(err));
})


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne()
  .then(favorite => {
    if (!favorite.campsites.includes(req.body)) {
      favorite.campsites.push(req.body)
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.end('That campsite is already in the list of favorites!');
    }
    if (!favorite.campsites) {
      Favorite.create()
      .then(favorite => {
        favorite.save()
      })
    }

  })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  res.statusCode = 403;
  res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  Favorite.findOne({ user: req.user._id })
  .then(favorite => {
    if (favorite) {
      const index = favorite.campsites.indexOf(req.params.campsiteId);
      favorite.campsites.splice(index, 1);
      favorite.save()
      .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(favorite);
      })
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.end('There are no favorites to delete');
    }
  })
})

module.exports = favoriteRouter;
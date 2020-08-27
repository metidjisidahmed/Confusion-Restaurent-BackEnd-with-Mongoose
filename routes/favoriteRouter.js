const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions , (req,res,next)=>{res.sendStatus("200")})
    .get(cors.cors ,authenticate.verifyUser , (req, res, next) => {
        Favorites.findOne({user : req.user._id})
            .populate('user')
            .populate('dishes')
            .then((favorites)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);

            } , (err)=>{ return next(err)})
            .catch(err => {return next(err)})
    })
    .post(cors.corsWithOptions ,authenticate.verifyUser , (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if (favorites != null) {
                    req.body.forEach(dish => {
                        const id = dish._id;
                        console.log('Id Dish now :', id);
                        if (favorites.dishes.indexOf(id) === -1) {
                            console.log(favorites);
                            console.log('We added :', id);
                            favorites.dishes.push(id);
                        }
                    });
                    favorites.save()
                        .then((newFavorites) => {
                            Favorites.findOne({_id : newFavorites._id})
                                .populate('user')
                                .populate('dishes')
                                .then((favorites)=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorites);
                                } , err=>next(err))
                        }, (err) => {
                            return next(err)
                        })
                        .catch(err => next(err));
                } else {
                    Favorites.create({user: req.user._id, dishes: req.body})
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then(favorite=>{
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                } , err=>next(err));
                        }, (err) => {
                            return next(err)
                        })
                        .catch(err => next(err));
                }

            }, (err) => next(err))
            .catch(err => next(err));

    })
    .delete(authenticate.verifyUser , (req, res, next) => {
        Favorites.findOneAndDelete({user: req.user._id})
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                // res.write('The favorites are deleted sucessfully !');
                res.json(favorites);
            }, err => next(err))
            .catch(err => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions , (req,res,next)=>{res.sendStatus("200")})
    .get( authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({"exists": false, "favorites": favorites});
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({"exists": false, "favorites": favorites});
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({"exists": true, "favorites": favorites});
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(authenticate.verifyUser , (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if (favorites != null) {
                    const id = req.params.dishId;
                    console.log('Id Dish now :', id);
                    if (favorites.dishes.indexOf(id) === -1) {
                        console.log(favorites);
                        console.log('We added :', id);
                        favorites.dishes.push(id);
                    }
                    favorites.save()
                        .then((newFavorites) => {
                            Favorites.findOne({_id : newFavorites._id})
                                .populate('user')
                                .populate('dishes')
                                .then((favorite)=>{
                                    Favorites.findById(favorite._id)
                                        .populate('user')
                                        .populate('dishes')
                                        .then(favorite=>{
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        } , err=>next(err));
                                } , err=>next(err))
                        }, (err) => {
                            return next(err)
                        })
                        .catch(err => next(err));
                } else {
                    Favorites.create({user: req.user._id, dishes: [req.params.dishId]})
                        .then((favorites) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorites);
                        }, (err) => {
                            return next(err)
                        })
                        .catch(err => next(err));
                }

            }, (err) => next(err))
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser , (req, res, next) => {
        Favorites.findOne({user: req.user._id})
            .then((favorites) => {
                if (favorites != null) {
                    const id = req.params.dishId;
                    console.log('Id Dish now :', id);
                    if (favorites.dishes.indexOf(id) !== -1) {
                        console.log(favorites);
                        console.log('id to delete :', id);
                        console.log('its index is : ',favorites.dishes.indexOf(id));
                        favorites.dishes.splice(favorites.dishes.indexOf(id), 1);
                        favorites.save()
                            .then((newFavorites) => {
                                Favorites.findOne({_id : newFavorites._id})
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorites)=>{
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorites);
                                    } , err=>next(err))
                            }, (err) => {
                                return next(err)
                            })
                            .catch(err => next(err));
                    }
                }
            }, (err) => next(err))
            .catch(err => next(err));
    });
module.exports = favoriteRouter;
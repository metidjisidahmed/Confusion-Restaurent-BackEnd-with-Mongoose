const express = require('express');
const bodyParser = require('body-parser');
const Dishes = require('../models/dishes');
const authenticate = require('../authenticate');
const cors = require('./cors');


const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
    .options(cors.corsWithOptions , (req, res, next) => {res.sendStatus(200)})
    .get(cors.cors , (req,res,next) => {
        // req query is the variables added after the route using ? ( for example /dishes?featured=true in this case req.query = {featured=true} )
        Dishes.find(req.query)
            .populate('comments.author')
            .then((dishes)=>{
                res.setHeader('Content-Types', 'application/json');
                res.statusCode=200;
                res.json(dishes);
            }, (err)=>{next(err)})
            .catch((err)=>{next(err)});
    })
    .post( cors.corsWithOptions ,authenticate.verifyUser  ,authenticate.verifyAdmin, (req, res, next) => {
        Dishes.create(req.body)
            .then((dish)=>{
                res.setHeader('Content-Types', 'application/json');
                res.statusCode=200;
                res.json(dish);
            }, (err)=>{next(err)})
            .catch((err)=>{next(err)});
    })
    .put(cors.corsWithOptions ,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete( cors.corsWithOptions , authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
       Dishes.deleteMany({})
           .then((resp)=>{
               res.setHeader('Content-Types', 'application/json');
               res.statusCode=200;
               res.json(resp);
           }, (err)=>{next(err)})
           .catch((err)=>{next(err)});
    });
dishRouter.route('/:dishId')
    .options(cors.corsWithOptions , (req, res, next) => {res.sendStatus(200)})
    .get(cors.cors , ((req, res, next) => {
        Dishes.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish)=>{
                res.setHeader('Content-Types', 'application/json');
                res.statusCode=200;
                res.json(dish);
            }, (err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .post(cors.corsWithOptions,  authenticate.verifyUser ,authenticate.verifyAdmin, ((req, res, next) => {
        res.statusCode = 403;
        res.end(`The POST operation is not supported in /dishes/${req.params.dishId}`);
    }))
    .put(cors.corsWithOptions , authenticate.verifyUser , authenticate.verifyAdmin, ((req, res, next) => {
        Dishes.findByIdAndUpdate(req.params.dishId ,{$set : req.body} , {new: true} )
            .then((dishUpdated)=>{
                res.setHeader('Content-Types', 'application/json');
                res.statusCode=200;
                res.json(dishUpdated);
            }, (err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .delete( cors.corsWithOptions , authenticate.verifyUser , authenticate.verifyAdmin ,  ((req, res, next) => {
        Dishes.findByIdAndDelete(req.params.dishId)
            .then((resp)=>{
                res.setHeader('Content-Types', 'application/json');
                res.statusCode=200;
                res.json(resp);
            }, (err)=>{next(err)})
            .catch((err)=>{next(err)});
    }));


module.exports = dishRouter;
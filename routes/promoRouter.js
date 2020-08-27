const express = require('express');
const bodyParser = require('body-parser');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

promoRouter.route('/')
    .options(cors.corsWithOptions , ((req, res, next) => {res.sendStatus(200)}))
    .get(cors.cors ,((req, res, next) => {
        Promotions.find(req.query)
            .then((promos)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promos);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)})
    }))
    .post( cors.corsWithOptions ,  authenticate.verifyUser,((req,res,next)=>{
        Promotions.create(req.body)
            .then((promo)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)})
    }))
    .put( cors.corsWithOptions ,authenticate.verifyUser,((req, res, next) => {
        res.statusCode = 403;
        res.end('The PUT opertaion is not supported in /promotions ')
    }))
    .delete( cors.corsWithOptions ,authenticate.verifyUser,((req, res, next) => {
        Promotions.deleteMany({})
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            });
    }));
promoRouter.route('/:promoId')
    .options(cors.corsWithOptions , (req, res, next) => {res.sendStatus(200)})
    .get(cors.cors ,((req, res, next) => {
        Promotions.findById(req.params.promoId)
            .then((promo)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .post( cors.corsWithOptions , authenticate.verifyUser,((req, res, next) => {
        res.statusCode = 403;
        res.end(`The POST operation is not supported in /promotions/${req.params.promoId}`);
    }))
    .put( cors.corsWithOptions , authenticate.verifyUser,((req, res, next) => {
        Promotions.findByIdAndUpdate(req.params.promoId, {$set : req.body} , {new:true})
            .then((updatedPromo)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedPromo);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .delete( cors.corsWithOptions ,authenticate.verifyUser,((req, res, next) => {
        Promotions.findByIdAndDelete(req.params.promoId)
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)})
    }));
module.exports = promoRouter;
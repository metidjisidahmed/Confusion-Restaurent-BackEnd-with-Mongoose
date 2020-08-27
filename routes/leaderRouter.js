const express = require('express');
const bodyParser = require('body-parser');
const Leaders = require('../models/leaders');
const authenticate = require('../authenticate');
const cors = require('./cors');

const leaderRoute = express.Router();
leaderRoute.use(bodyParser.json());
leaderRoute.route('/')
    .options(cors.corsWithOptions , (req, res, next) => {res.sendStatus(200)})
    .get(cors.cors ,(req,res,next)=>{
        Leaders.find(req.query)
            .then((leaders)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leaders);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    })
    .post( cors.corsWithOptions ,authenticate.verifyUser,authenticate.verifyAdmin , ( (req, res, next) => {
        Leaders.create(req.body)
            .then((leader)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .put( cors.corsWithOptions , authenticate.verifyUser,  authenticate.verifyAdmin, ((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported in /leaders');
    }))
    .delete( cors.corsWithOptions ,authenticate.verifyUser, authenticate.verifyAdmin,   ((req, res, next) => {
        Leaders.deleteMany({})
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }));

leaderRoute.route('/:leaderId')
    .options(cors.corsWithOptions , (req, res, next) => {res.sendStatus(200)})
    .get(cors.cors , ((req, res, next) => {
        Leaders.findById(req.params.leaderId)
            .then((leader)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(leader);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .post(cors.corsWithOptions , authenticate.verifyUser, authenticate.verifyAdmin, ((req, res, next) => {
        res.statusCode = 403;
        res.end(`The POST operation is not supported in /leaders/${req.params.leaderId}`);
    }))
    .put( cors.corsWithOptions ,authenticate.verifyUser, authenticate.verifyAdmin, ((req, res, next) => {
        Leaders.findByIdAndUpdate(req.params.leaderId , {$set : req.body}, {new : true})
            .then((updatedLeader)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedLeader);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }))
    .delete( cors.corsWithOptions ,authenticate.verifyUser, authenticate.verifyAdmin ,((req, res, next) => {
        Leaders.findByIdAndDelete(req.params.leaderId)
            .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            },(err)=>{next(err)})
            .catch((err)=>{next(err)});
    }));

module.exports = leaderRoute;
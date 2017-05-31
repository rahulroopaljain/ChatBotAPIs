const express = require ('express');
const fs = require ('fs');
const logger = require('winston');
const railwayController = require ('./railway_controller');
const router = express.Router();


router.post('/railindigo/api', function(req, res){
    railwayController.processRequest(req.body, function (response) {
        res.set('Content-Type', 'application/json');
        res.status(200).send(response);
    });
});


router.get('/sping', function(req, res){
    logger.info("First Log");
    res.status(200).send("ok");
});


module.exports = router;
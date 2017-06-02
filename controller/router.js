const express = require ('express');
const fs = require ('fs');
const logger = require('winston');
const railwayController = require ('./railway_controller');
const router = express.Router();


router.post('/railindigo/api', function(req, res){
    railwayController.processRequest(req.body, function (response) {
        res.set('Content-Type', 'application/json');
        res.status(200).send(response);
        logger.info('Response sent back to client: ' + JSON.stringify(response));
    });
});


router.get('/sping', function(req, res){
    logger.info('GET /sping call started.');
    res.status(200).send("ok");
    logger.info('/sping 200 \'OK\', completed successfully.');
});


module.exports = router;
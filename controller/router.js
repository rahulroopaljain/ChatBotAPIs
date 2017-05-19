const express = require ('express');
const railwayController = require ('./railway_controller');
const router = express.Router();

router.get('/', function(req, res){
    res.status(200).send("ok");
});

router.post('/railindigo/api', function(req, res){
    console.log("Roopal");
    railwayController.processRequest(req.body, function (response) {
        res.set('Content-Type', 'application/json');
        res.send(response);
    });
});

module.exports = router;
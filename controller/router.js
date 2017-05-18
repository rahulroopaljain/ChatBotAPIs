const express = require ('express');
const railwayController = require ('./railway_controller');
const router = express.Router();

// route for Railway bot requests
/*router.post('/railindigo/api', function(req, res){
    var response = railwayController.processRequest(req.body, res);
    res.send({PNR: response});
});
*/

router.post('/railindigo/api', function(req, res){
    railwayController.processRequest(req.body, function (response) {
        res.set('Content-Type', 'application/json');
        res.send(response);
    });
});

module.exports = router;
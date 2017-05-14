const express = require ('express');
const router = express.Router();

// route for Railway bot requests
router.post('/railindigo/api', function(req, res){
    res.send({type: 'Called from railway bot'});
});

module.exports = router;
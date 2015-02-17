'use strict';

var _ = require('lodash'),
    pdfToJson = require('./pdfToJson.services');

exports.json = function(req, res) {
  var date =  req.params.date.replace("-","/");
  pdfToJson.getJson(date, function (err, jsonPdf) {
    if(err) { 
      console.log("error is", err);
      return handleError(res, err); 
    }
    if(!jsonPdf) { return res.send(404); }
    //console.log("returnning response",unescape(jsonPdf.data.Pages[0].Texts[0].R[0].T) );
      return res.json(200, jsonPdf);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

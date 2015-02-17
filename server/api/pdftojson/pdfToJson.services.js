'use strict';
var PDFParser = require('../../../node_modules/pdf2json/pdfparser'),
    _ = require('lodash'),
    nodeUtil = require("util"),
    fs = require('fs');

exports.getJson = function getJson(date, CallBack){
  var pdfParser = new PDFParser();


  var _onPFBinDataError = function(err){
    return CallBack(err, null);
  };

  var _onPFBinDataReady = function(pdfObj){
    var days = {
       "lundi"   : 0,//27,
       "mardi"   : 1,//50,
       "mercredi": 2,//72,
       "jeudi"   : 3,//95,
       "vendredi": 4,//115,
       "samedi"  : 5,
       "dimanche": 6
    };

    var padding = [27, 49, 72, 95, 115, 138, 161];
    var startParse = false;
    var stopParse = false;
    var Plan = [];
    var course = {
      hours: "",
      name: "",
      teachears:"",
      room:""
    };
    var canRead = false;
    var curText;
    var day = 9;
    //console.log("data", data);
    //console.log("Pages Height",  pdfObj.data.Pages[0].Height);
    //console.log("Pages Hlines",pdfObj.data.Pages[0].HLines);
    //console.log("Pages Vlines", pdfObj.data.Pages[0].VLines);
    //console.log("Pages fills", pdfObj.data.Pages[0].Fills);
    var pageNumber = -1;
    var day;
    pdfObj.data.Pages.forEach(function(page, idx){
      page.Texts.forEach(function(text){
        curText = unescape(text.R[0].T).trim();
        if(curText.indexOf(date) !== -1){
          var dayOfweek = curText.split(" ")[0];
          day  = days[dayOfweek]
          //console.log("day is", day, dayOfweek);
          pageNumber = idx;
          return;
        }
      });
      if(pageNumber !== -1){
        return;
      }
    });
    if(pageNumber ===  -1){
      return CallBack("err while parsing pdf", null);
    }
    var checkedFirstHours = false;
    var textsLength = pdfObj.data.Pages[pageNumber].Texts.length;
    pdfObj.data.Pages[pageNumber].Texts.forEach(function(text, textIdx) {
      
      curText = unescape(text.R[0].T).trim();

      //console.log(typeof(day));
      //console.log("Pages==>,",curText, text.R[0].TS);
      var isValidTest = day === 0 ? text.x < padding[0]: day === 6? text.x < padding[6] && text.x > padding[6]: text.x > padding[day-1] && text.x <  padding[day]? true: false;
        if( isValidTest){
          
          //console.log(curText, padding[day-1]);
          if( text.R[0].TS[1] === 60){
            course.hours += curText+" ";
          }

          if(/^(M\.|Mme)/.test(curText)){
            course.teachears += curText+" ";
          }else if(/^(NA|RE)/.test(curText)){
            course.room += curText+" ";
          }
          else if(curText !== "," &&curText !== "Cours" && /^[A-Z]/.test(curText)){
            course.name += curText+" ";
          }

          if(/(^[0-9])/.test(curText) && curText.length === 1){
            if(checkedFirstHours){
              Plan.push(course);
              course = { hours: "", name: "", teachears:"", room:"" };
            }
            else{
              checkedFirstHours = true;
            }
          }
          
        }
        if(textIdx === textsLength-1){
          Plan.push(course);
        }
      //console.log("Pages==>, ",pdfObj.PDFJS);
    });
    return CallBack(null, Plan);
  };

  pdfParser.on("pdfParser_dataReady", _.bind(_onPFBinDataReady, this));

  pdfParser.on("pdfParser_dataError", _.bind(_onPFBinDataError, this));

  var pdfFilePath =  "/home/madalien/Documents/GesAlendar/server/api/pdftojson/resources/planning.pdf";

  pdfParser.loadPDF(pdfFilePath);

};

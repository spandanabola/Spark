const mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
//var exceltojson;
var xlstojson = require("xls-to-json");
var xlsxtojson = require("xlsx-to-json");

var ext;
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        console.log("inside file");
        callback(null, './uploads')
    },
    filename: function (req, file, callback) {
        console.log("fileName " + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname)
        console.log(file.originalname);
        if (ext == '.xlsx' || ext == '.xls') {
            console.log("file type " + ext);
            callback(null, true)
        } else {
            return callback('Only xlsx and xls file is allowed', null);
        }

    }
}).single("userFile");

module.exports = {

    fileUpload: (req, res) => {

        console.log("inside file upload");
        ses = req.session;
        var exceltojson;

        upload(req, res, function (err) {
            if (err) {
                res.json({ error_code: 1, err_desc: err });
                res.end();
                //return;
            }
            /** Multer gives us file info in req.file object */
            else if (!req.file) {
                res.json({ error_code: 1, err_desc: "No file passed" });
                res.end();
                // return;
            } else {

                if (ext == '.xlsx') {
                    console.log("it is equalled");
                    exceltojson = xlsxtojson;
                } else {
                    exceltojson = xlstojson;
                }
                try {
                    exceltojson({
                        input: req.file.path, //the same path where we uploaded our file
                        output: null, //since we don't need output.json
                        lowerCaseHeaders: true
                    }, function (err, result) {
                        if (err) {
                            return res.json({ error_code: 1, err_desc: err, data: null });
                        } else {
                            console.log(result);
                            try {
                                fs.unlinkSync(req.file.path);
                            } catch (e) {
                                console.log(e);
                                //error deleting the file
                            }
                            res.json({ error_code: 0, err_desc: null, data: result });
                            res.end();
                        }

                    });
                } catch (e) {
                    console.log(e);
                    res.json({ error_code: 1, err_desc: "Corupted excel file" });
                    res.end();
                }


            }
            //start convert process
            /** Check the extension of the incoming file and 
             *  use the appropriate module
             */

        })
    }
}
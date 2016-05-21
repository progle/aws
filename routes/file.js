var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var multer = require('multer');
var path = require('path');
var fs = require('fs');

var connection = mysql.createConnection({
    host : 'user_host',
    user : 'user_name',
    password : 'user_pw',
    database : 'user_Db'
});

var _storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './uploads');
	},
	filename: function(req, file, cb){
		cb(null, Date.now()+"."+file.originalname.split('.').pop());
	}
});

var upload = multer({storage : _storage});

router.get("/", function(req, res){
	res.render('fileup', function(err, content){
		if(!err){
			res.end(content);
		}else{
			res.writeHead(501, {'Content-Type' : 'text/plain'});
			res.end("error while reading a file");
		}
	});
});

router.post('/upload', upload.single('userPhoto'), function(req, res){
	var filename = req.file.filename;
	var path = req.file.path;
	console.log(path);
	connection.query('INSERT INTO file(filename, path) VALUES(?, ?);', [filename, path], function(err, info){
		if(err!=undifined)
			res.sendStatus(501);
		else
			res.redirect('/' + info.insertId);
	});
	console.log(filename);
});

router.get('/:file_id', function(req,res, next){
	connection.query('select * from file where id = ?;', [req.params.file_id], function(err, cursor){
		if(err!=undifined)
			res.sendStatus(503);
		else
			if(cursor.length==undifined || cursor.length<1)
				res.sendStatus(404);
			else
				res.json(cursor[0]);
	});
});

router.get('/uploads/:file_name', function(req, res, next){
	connection.query('select * from file where filename = :?;', [req.params.file_name], function(err, cursor){
		if(err!=undefined)
			res.sendStatus(503);
		else
			if(cursor.length == undefined || cursor.length<1)
				res.sendStatus(404);
			else
				res.sendFile(path.join(__dirname, '../', cursor[0].path));
	});
});

module.exports = router;

var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var qs = require('querystring');

/** config server */
var config = {
	port: 8080,
	modeDebug: true,
	mainPage: 	'index.html',
	saveFile: 	'comments.json',
	dataMethod: 'POST',
	mimeTypes: {
								'.json': 	'text/json',
								'.js': 		'text/javascript',
								'.html': 	'text/html',
								'.css': 	'text/css',
								'.jpg': 	'image/jpeg',
								'.gif': 	'image/gif'
							}
};

/**
* write comment, return all comments
*
* @parametr {oject} obj - comment
* @parametr {string} saveFile - file name for save the comment
* @return {string} - all comments
*/
function appendObject(obj, saveFile){
  var commentsFile = fs.readFileSync('./' + saveFile);
  var comments = JSON.parse(commentsFile);
  comments.push(obj);
  var commentsJSON = JSON.stringify(comments);
  fs.writeFileSync('./' + saveFile, commentsJSON);
  return commentsJSON;
}

/** 
*	retrun response server
*
* @parametr {object} response - response object
* @parametr {string} fileName - response file
* @parametr {array} mimeTypes - array mime types for content type
*/
function getResponseBase(response, fileName, mimeTypes) {
	fs.readFile(fileName, 'utf8', function(error, data) {
			if(error){
				console.log('Could not find or open file for reading\n');
			} else {
				response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(fileName)] });
				response.end(data);
			}
		});
}

/** create http server */
http.createServer(function (request, response) {

	var pathname = url.parse(request.url).pathname;
	
	if (config.modeDebug) {
		console.log("get request " + pathname);
		console.log("request method " + request.method);
	}

	/* main page*/
	if (pathname == '/')	{
		getResponseBase(response, config.mainPage, config.mimeTypes);
	}

	/* write comments in the file */
	if (pathname == '/' + config.saveFile && request.method == config.dataMethod) {
		
		var bodyRequest = '';
		/* get request data */
		request.on('data', function (chunk) {
	    bodyRequest += chunk;
	  });
		/* extract request params */
		request.on('end', function () {
	    var comment = qs.parse(bodyRequest);	

	    if (config.modeDebug) {
				console.log('comment:');
				console.log(comment);

				console.log('comment type:');
	    	console.log(typeof comment);
	    }    	    

	    var allResponseObject = appendObject(comment, config.saveFile);
    	if (config.modeDebug) {
    		console.log(allResponseObject);
  		}
  		/* response write json string and content type the json */
	    response.writeHead(200, { 'Content-Type': config.mimeTypes[path.extname(pathname)] });
			response.end(allResponseObject);
	  });	

	}
	/* return all comments */
	else if (pathname == '/' + config.saveFile) { 
		pathname = pathname.substring(1, pathname.length);
		getResponseBase(response, pathname, config.mimeTypes);
	} 
	/* retrun other file */
	else {
		pathname = pathname.substring(1, pathname.length);
		getResponseBase(response, pathname, config.mimeTypes);
	}

}).listen(config.port);

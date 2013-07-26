exports.startup = function(port) {
	var http = require('http');
	var fs = require('fs');
	var url = require('url');
	var path = require('path');
	var program = require('commander');
	var exec = require('child_process').exec;
	var mimetypes = require('./mimetypes');

	//HTML Templates
	var template_begin = "<html><head><title>Directory list for {{REQUEST_PATH}}</title></head>\
	<body><h2>Directory list for {{REQUEST_PATH}}</h2><hr><ul>";
	var request_path_reg = /{{REQUEST_PATH}}/g;
	var template_end = "</ul></body></html>";

	var template_file = "<li style='color:#FF;'>\
	<a href='{{FILE_LINK}}'>{{FILE_NAME}}</a></li>";
	var file_link_reg = /{{FILE_LINK}}/;
	var file_name_reg = /{{FILE_NAME}}/;

	var template_folder = "<li style='color:#FFC40D;'>\
	<a href='{{FOLDER_LINK}}'>{{FOLDER_NAME}}</a></li>";
	var folder_link_reg = /{{FOLDER_LINK}}/;
	var folder_name_reg = /{{FOLDER_NAME}}/;

	http.createServer(function(req, res) {
		var reqeustPath = global.decodeURIComponent(url.parse(req.url).pathname);
		var fullPath = path.join(process.cwd(), reqeustPath);

		if(!fs.existsSync(fullPath)){
			console.log("Request path: " + reqeustPath + " " + 404);
			res.writeHead(404);
			res.end();
			return;
		}
		console.log("Request path: " + reqeustPath);
		var stats = fs.statSync(fullPath);
		if(stats.isFile()){
			var ext = path.extname(fullPath);
			var filename = path.basename(fullPath);
			var type = mimetypes[ext];
			if(type == undefined){
				res.setHeader('Content-disposition', 'attachment; filename=' + filename);
				res.setHeader('Content-type', "text/plain");
			}else{
				res.setHeader('Content-disposition', 'inline; filename=' + filename);
				res.setHeader('Content-type', type);
			}
			
			var filestream = fs.createReadStream(fullPath);
			filestream.pipe(res);
		} else if(stats.isDirectory()){
			var lastChar = reqeustPath[reqeustPath.length - 1];
			if (lastChar != "/") {
				reqeustPath = reqeustPath + "/";
			}
			//enumerate all the files in this directory
			fs.readdir(fullPath, function(err, files) {
				var folder_content = "";
				for (var i = 0; i < files.length; i++) {
					var f = files[i];
					var relativePath = reqeustPath + f;
					relativePath = relativePath.substr(1, relativePath.length -1);
					var subFile = path.join(fullPath, f);
					var fstats = fs.statSync(subFile);
					var fileItem = "";
					if (fstats.isDirectory()) {
						f += "/"
						fileItem = template_folder.replace(folder_link_reg,  
							global.encodeURIComponent(relativePath));
						fileItem = fileItem.replace(folder_name_reg, f);
					} else {
						fileItem = template_file.replace(file_link_reg,  
							global.encodeURIComponent(relativePath));
						fileItem = fileItem.replace(file_name_reg, f);
					}
					folder_content += fileItem;
				}
				var start = template_begin.replace(request_path_reg , reqeustPath);
				var content = start + folder_content + template_end;
				res.writeHead(200, {
					"Content-Type": "text/html",
					"Content-Length": content.length
				});
				res.write(content);
				res.end();
			});
		}else{
			res.end();
		}
	}).listen(port, '0.0.0.0');

	console.log('Server running at http://localhost:' + port);
}
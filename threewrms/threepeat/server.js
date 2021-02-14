// Adapted from this _WikiBooks OpenGL Programming Video Capture article_.
// re-adapted from http://fhtr.blogspot.com/2014/02/saving-out-video-frames-from-webgl-app.html by @andr-ew

var port = 3999;
var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
    });
    if (req.method === 'OPTIONS') {
        // Handle OPTIONS requests to work with JQuery and other libs that cause preflighted CORS requests.
        res.end();
        return;
    }
    var idx = req.url.split('/').pop();
    var filename = ("0000" + idx).slice(-5)+".png";
    var img = new Buffer('');
    req.on('data', function(chunk) {
        img = Buffer.concat([img, chunk]);
    });
    req.on('end', function() {
        var f = fs.writeFileSync(filename, img);
        console.log('Wrote ' + filename);
        res.end();
    });
}).listen(port, '127.0.0.1');
console.log('Server running at http://127.0.0.1:'+port+'/');

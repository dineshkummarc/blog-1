// Just a basic server setup for this site
var Stack = require('stack'),
    Creationix = require('creationix'),
    Http = require('http'),
    port = process.env.PORT || 3000;

Http.createServer(Stack(
  Creationix.log(),
  require('wheat')(__dirname)
)).listen(port);

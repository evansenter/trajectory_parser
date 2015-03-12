"use strict";

var stream  = require("stream");
var by_line = new stream.Transform({ objectMode: true });
 
by_line._transform = function(chunk, encoding, done) {
  var string = chunk.toString();
  if (this.partial_line !== "") {
    string = this.partial_line + string;
  }
 
  var lines         = string.split("\n");
  this.partial_line = lines[lines.length - 2] + "\n" + lines.pop();
  
  for (var i = 0; i < lines.length - 1; i++) {
    this.push([lines[i], lines[i + 1]]);
  }
  
  done();
};
 
by_line._flush = function(done) {
  if (this.partial_line !== "") {
    this.push(this.partial_line);
  }
    
  this.partial_line = null;
  done();
};
 
module.exports = by_line;

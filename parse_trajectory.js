var by_double_lines = require("./line_pair_streamer");
var _               = require("underscore");
var fs              = require("fs");
var debug           = _.tap(require("debug"), function(debug) { debug.enable("*"); })("parse_trajectory");
var ap              = require("prettyjson").render;
var options         = require("yargs")
                        .usage("Usage: $0 [options]")
                        .example("$0 -t 10000 -f trajectory.txt", "generate the transition matrix for trajectory.txt where basins of attraction take longer than 10,000 steps to leave")
                        .options({
                          "v": {
                            alias: "verbose",
                            describe: "Print verbose output",
                            default: false,
                            type: "boolean"
                          },
                          "vv": {
                            alias: "very_verbose",
                            describe: "Print extremely verbose output",
                            default: false,
                            type: "boolean"
                          },
                          "f": {
                            alias: "input",
                            describe: "Load a trajectory file",
                            type: "string",
                            demand: true
                          },
                          "o": {
                            alias: "output",
                            describe: "Output transition probability matrix file",
                            type: "string"
                          },
                          "t": {
                            alias: "threshold",
                            describe: "Set a threshold for basins",
                            demand: true
                          }
                        })
                        .nargs("f", 1)
                        .nargs("t", 1)
                        .check(function(object, mapping) {
                          function pretty_warn(key, error) {
                            return "Error with " + _.first(mapping[key]) + " option: " + error;
                          }
                  
                          if (!fs.existsSync(object.f)) {
                            return pretty_warn("f", object.f + " does not appear to be a valid file path");
                          }
                          
                          if (object.o && fs.existsSync(object.o)) {
                            return pretty_warn("o", object.o + " already exists, chickening out");
                          }
                  
                          if (!_.isNumber(object.t)) {
                            return pretty_warn("t", object.t + " is not a number");
                          }
                  
                          if (object.t <= 0) {
                            return pretty_warn("t", object.t + " is not greater than 0");
                          }
                  
                          return true;
                        })
                        .help("h")
                        .alias("h", "help")
                        .wrap(null)
                        .argv;

if (options.very_verbose) {
  options.v = options.verbose = true;
}

var notify = function(string, is_object) {
  if (options.verbose) {
    if (is_object === true) {
      _.compose(console.log.bind(console), ap)(string);
    } else {
      debug(string);
    }
  }                
};

var heavy_notify = function(string, is_object) {
  if (options.very_verbose) {
    notify(string, is_object);
  }
};

notify(options, true);
notify("Starting to read the file");

by_double_lines.count = 0;
var basins            = [];
var trajectory_file   = fs.createReadStream(options.input);
trajectory_file.pipe(by_double_lines);

by_double_lines.on("readable", function() {
  var lines, states, previous_state, state;
  
  function parse_line(line) {
    var valid_line = /([\(\)\.]+)\t(\d+\.\d+)\t(\d+)/; 
    var match      = line.match(valid_line);
    
    if (match) {
      return {
        structure: match[1],
        time_in_previous: Number(match[2]),
        num_neighbors: Number(match[3]),
      };
    }
    
    return false;
  }
  
  while (lines = this.read()) {
    this.count += 1;
    
    if (this.count % 100000 === 0 && options.v && !options.vv) {
      process.stdout.write(".");
    }
    
    if (_.all(states = _.map(lines, parse_line), _.identity)) {
      previous_state = _.first(states);
      state          = _.last(states);
      
      if (state.time_in_previous >= options.threshold) {
        basins.push({
          structure: previous_state.structure,
          time: state.time_in_previous
        });
        
        heavy_notify(_.last(basins).structure + " " + _.last(basins).time.toFixed(4));
      }
    }
  }
});

by_double_lines.on("end", function() {
  if (options.v && !options.vv) {
    process.stdout.write("\n");
  }
  
  var basin_indices    = _.chain(basins).pluck("structure").uniq().value();
  var basin_double_map = { from_i: {}, from_str: {} };
  var transition_table = {};  
  
  (function build_basin_double_map() {
    var basin, i;
    
    _.each(_.zip(basin_indices, _.range(basin_indices.length)), function(array) {
      basin                            = array[0];
      i                                = array[1];
      basin_double_map.from_str[basin] = i;
      basin_double_map.from_i[i]       = basin;
    });
  })();
  
  notify("Lines read: " + this.count);
  notify("Number of basins: " + basins.length);
  notify("Number of unique basins: " + basin_indices.length);
  notify(basin_double_map.from_i, true);
  notify("Building the transition matrix");
  
  (function build_transition_table() {
    function sum_function(val, sum) { 
      return val + sum; 
    }
    
    function normalize(i, j, sum) { 
      transition_table[i][j] /= sum; 
    }
    
    function str_index_at_basins(pos) {
      return basin_double_map.from_str[basins[pos].structure];
    }
    
    for (var i = 0; i < basin_indices.length; i++) {
      for (var pos = 0; pos < basins.length - 1; pos++) {
        if (str_index_at_basins(pos) === i) {
          var next = str_index_at_basins(pos + 1);
        
          transition_table[i]        = transition_table[i] || {};
          transition_table[i][next]  = transition_table[i][next] || 0;
          transition_table[i][next] += 1;
        }
      }
    
      var sum = _.chain(transition_table[i]).values().reduce(sum_function).value();
      _.each(_.keys(transition_table[i]), _.partial(normalize, i, _, sum));
    }
  })();
  
  heavy_notify(transition_table, true);
  notify("Transition matrix complete");
  
  if (options.output) {
    notify("Writing output file");
    var output = fs.createWriteStream(options.output);
  
    function int_key_sorter(object) {
      return _.chain(object).keys().map(Number).sortBy(_.identity).value();
    }
  
    output.on("open", function(file) {
      _.each(int_key_sorter(transition_table), function(i) {
        _.each(int_key_sorter(transition_table[i]), function(j) {
          output.write([i, j, transition_table[i][j]].join(",") + "\n");
        });
      });
    
      output.end();
    });
  
    output.on("finish", function() {
      notify("Output file complete, written to " + options.output);
      notify("You can use this file with Hermes in the following fashion: RNAmfpt -T -A {start_state} -Z {end_state} -c " + options.output);
    });
  }
});

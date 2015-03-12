# trajectory_parser

[![npm version](https://badge.fury.io/js/trajectory_parser.svg)](http://badge.fury.io/js/trajectory_parser)

## Usage

    Usage: parse_trajectory.js [options]

    Options:
      -v, --verbose         Print verbose output                       [default: false]
      --vv, --very_verbose  Print extremely verbose output             [default: false]
      -f, --input           Load a trajectory file                     [required]
      -o, --output          Output transition probability matrix file
      -t, --threshold       Set a threshold for basins                 [required]
      -h, --help            Show help                                

    Examples:
      parse_trajectory.js -t 10000 -f trajectory.txt    generate the transition matrix for trajectory.txt where basins of attraction take longer than 10,000 steps to leave

## Example

Simple use case:

    node parse_trajectory.js -v -f ../outLcollosomaFlux.txt -t 100 -o
    
Returns something of the form:
    
    _: 
      (empty array)
    v:            true
    verbose:      true
    vv:           false
    very_verbose: false
    f:            ../outLcollosomaFlux.txt
    input:        ../outLcollosomaFlux.txt
    t:            100
    threshold:    100
    o:            
    output:       
    $0:           parse_trajectory.js
      parse_trajectory Starting to read the file +0ms
      parse_trajectory Lines read: 15906 +100ms
      parse_trajectory Number of basins: 919 +1ms
      parse_trajectory Number of unique basins: 16 +0ms
    0:  ........(((((..(((((.((((...)))).)))))..)))...).).......
    1:  ..((....(((((..(((((.((((...)))).)))))..)))...).))).....
    2:  ........(((((..(((((.((((...)))).)))))..))).)...).......
    3:  ..((..((..(((..(((((.((((...)))).)))))..))).).)..)).....
    4:  ..((..(...(((..(((((.((((...)))).)))))..)))...)..)).....
    5:  .........((((..(((((.((((...)))).)))))..))).)((....))...
    6:  .......(..(((..(((((.((((...)))).)))))..))).)((....))...
    7:  .....((...(((..(((((.((((...)))).)))))..)))..((....)))).
    8:  ......((..(((..(((((.((((...)))).)))))..)))..((....)))).
    9:  ..........(((..(((((.((((...)))).)))))..)))(.((....)))..
    10: ..........(((..(((((.((((...)))).)))))..)))..((....))...
    11: ......(...(((..(((((.((((...)))).)))))..))).)((....))...
    12: ..........(((..(((((.((((...)))).)))))..)))(.((....)).).
    13: ....((....(((..(((((.((((...)))).)))))..)))..((....)))).
    14: ..((.(.(..(((..(((((.((((...)))).)))))..))).).)..)).....
    15: ..((.(..(((((..(((((.((((...)))).)))))..))).)))..)).....
      parse_trajectory Building the transition matrix +0ms
      parse_trajectory Transition matrix complete +8ms

## Contributing

1. Fork it ( https://github.com/evansenter/trajectory_parser/fork )
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request
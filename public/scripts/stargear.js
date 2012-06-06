define(['/scripts/lib/d3.js',
        '/scripts/underscore.js'],function(d3,_) {


  var stargear = function(args) {

    var width = args.width ? args.width : 800,
        height = args.height ? args.height : 600,
        filters = args.filters ? args.filters : [];


    //math stuff
    var fact = function(i) {
      if (i==0) return 1;
      var ret = 1;
      for (var a=1;a<=i;a++) {
        ret = ret * a;
      } 
      return ret;
    }

    var comb = function(n,k) {
      return fact(n) / (fact(k) * fact(n-k));
    }


    var generatePowerSet = function (arr) {
      var ret = [],length, margin_padding = 100;


      //find out how many distributions so we can lay them out the right way
      var dists = [],
          dists_counter = [];
      for (var i=0; i<=arr.length;i++) {
        dists.push(comb(arr.length,i));
        dists_counter.push(0);
      }
      

      //for ( var i = 1; i <= Math.pow(2,arr.length); i++) {
      for ( var i = Math.pow(2,arr.length); i>=1; i--) {

        var working = i, working_set = [];
        for ( var k = arr.length; k >=0; k--) {
          if (Math.pow(2,k) < working) {
            working_set.push(arr[k]);
            working = working - Math.pow(2,k);
          }
        }

        //apply filters

        working_data = args.data;
        working_count = args.data.length;
        _.each(working_set, function(f) {
          working_data = _.filter(working_data,f.filter);
          working_count = working_data.length;
        });


        //find connections
        var connection_map = [];
        _.each(ret, function(d) {
          extra_filter = _.difference(d.filters,working_set);
          if ( d.filters.length == working_set.length + 1 &&
               extra_filter.length == 1 )
          {
            connection_map.push({"id":d.id,"count":d.count,"extra_filter":extra_filter[0]});
          }
        });

        if (working_set.length > 1) {
        ret.push({
          id:(new Date).getTime(),
          connections: connection_map,
          count:working_count,
          name:working_set.map(function(f) { return f.name}).join(','),
          coord:getStarCoords(working_set),
          filters:working_set,
          x:margin_padding+((width-(2*margin_padding))*working_set.length/arr.length),
          y:margin_padding+(
            (height-(2*margin_padding))*dists_counter[working_set.length]
            /
            dists[working_set.length] + (height-(2*margin_padding))/(1+dists[working_set.length]))
        });
        }

        dists_counter[working_set.length] = dists_counter[working_set.length] + 1;
      }
      

      return ret;
    }

    //returns the xy coords for the array of filters
    var getStarCoords = function(filters) {
     
      var points = [];
      for (var f in filters) {
        points.push({
          x:Math.sin(2*Math.PI*_.indexOf(args.filters,filters[f])/args.filters.length),
          y:Math.cos(2*Math.PI*_.indexOf(args.filters,filters[f])/args.filters.length)
        });
      }

      //find the intersection of the points
      var intersection  = _.reduce(points,function(memo, point) { 
          return {x:memo.x+point.x,y:memo.y+point.y}
        },
        {x:0,y:0}
      );

      intersection.x = intersection.x/points.length;
      intersection.y = intersection.y/points.length;

      return intersection;

    }


    var radius = 100;

    var vis = d3.select("#chart").append("svg:svg")
      .attr("width",width)
      .attr("height",height);

    var center = function(c) { return 250+(c*radius) };


    var border = _.map(args.filters,function(f) {
      return {
        x: center(Math.sin(2*Math.PI*_.indexOf(args.filters,f)/args.filters.length)),
        y: center(Math.cos(2*Math.PI*_.indexOf(args.filters,f)/args.filters.length))
      }
    });

   

    vis.selectAll("path")
      .data([{x:'yo'}])
      .enter().append("svg:path")
      .attr("d",function(d) {
        return _.reduce(border,function(memo,p) { return memo + p.x+","+p.y+" " },"M") + "Z";  
      })
      .attr("stroke","black")
      .attr("fill","none");
 
    this.data = generatePowerSet(filters);

    var node = vis.selectAll("g.node")
        .data(this.data)
      .enter().append("svg:g")
        .attr("transform", function(d) {return "translate("+center(d.coord.x)+","+center(d.coord.y)+")";})

    node.append("svg:circle")
      .attr("class",function(d) {return d.filters.map(function(l) {return l.name}).join(' ') + " node"})
      .attr("dx",200)
      .attr("stroke","black")
      .attr("fill","black")
      .attr("stroke-width","5px")
      .attr("r",function(d) {  return (10*d.count/args.data.length) + 2 });

     
    this.update = function(data) {
      args.data = args.data.concat(data);
      console.log(args.data.length);
      newdata = generatePowerSet(filters);
      var circle = node.selectAll("circle")
        .transition()
        .duration(500)
        .attr("r",function(d) {
          var obj = _.find(newdata,function(datum) { 
            return datum.name == d.name; } );
          
          return (10*obj.count/args.data.length) + 2 });

    }


  }






  return stargear;
});


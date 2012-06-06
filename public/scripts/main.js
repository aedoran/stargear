require(['stargear','sampledata','lib/socket.io'],
    function(stargear,sampledata,socketio) {

    var sg = new stargear(
    { 
      width   : 550,
      height  : 400,
      data    : sampledata.get(100),
      filters :  [
        { name   : "a",
          filter : function(user) {
            var now     = (new Date()).getTime(),
              last_login = (new Date(user.last_login)).getTime(),
              week       = 1000*60*60*24*7;

            return now - last_login < week;
          },
          color  : "#BE8586"},
        
        { name   : "b",
          filter : function(user) { return user.comments >= 10 && user.downloads >= 20 },
          color  : "#7CAF6C" },
        { name   : "c",
          filter : function(user) { return user.notes_num > 70 },
          color  : "#A2A6FE" },
        { name   : "d",
          filter : function(user) { return user.notes_num > 70 },
          color  : "#A2A6FE" },
        { name   : "e",
          filter : function(user) { return user.notes_num > 70 },
          color  : "#A2A6FE" },
          

    ],
      
    });


    setInterval(function() {
      var list = [];
      for (var c=0;c<300;c++) {
        sampledata.get();
        var a = sampledata.rand();
        a.comments = 12;
        a.notes_num = 88;
        a.downloads = 25;
        list.push(a);
      }
      sg.update(list);
    },1500);

});

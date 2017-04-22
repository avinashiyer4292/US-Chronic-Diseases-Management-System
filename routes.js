var express = require('express');
var router = express.Router();
var dbConfig = require('./dbConfig');
var oracledb = require('oracledb');
var body
  oracledb.createPool(
    {
      user: dbConfig.user,
      password: dbConfig.password,
      connectString: dbConfig.connectString
    },
    function(err) {
      if (err) {
        console.error("createPool() error: " + err.message);
        return;
      }

      // Create HTTP server and listen on port 'httpPort'

      //console.log("Server running.  Try requesting: http://localhost:" + httpPort + "/getimage");
    });


function doRelease(connection)
{
	console.log("Releasing connection...");
  connection.release(function(err) {
      if (err) {
        console.log("releasing error:" +err);
      }
    });

  console.log("connection after release: "+connection);
}

//Middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});


// Define the home page route
router.get('/', function(req, res) {
  res.render('index1');
});

//get map options for map view - this gets the data for race, disease and year


router.post('/getStateById',function(req,res){
	console.log("state "+req.body.id);
	console.log(req);
	oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("SELECT STATE FROM LOCATION WHERE STATEID=:id", 
        	{id:req.body.id},
		    function(err, result)
		      {
		        if (err) {
		          console.error(err.message);
		          doRelease(connection);
		          return;
		        }
		        console.log(result.metaData);
		        console.log(result.rows);

		        res.send(result.rows);
		        doRelease(connection);
		      });   
        
      });
});
router.get('/getRaces',function(req,res){
	getData(res,"SELECT STRATIFICATIONTYPE FROM STRATIFICATION");
});

router.get('/getDiseases',function(req,res){
	getData(res,"select DISEASE_DETAIL from DISEASE");
});


router.get('/getYears',function(req,res){
	getData(res,"SELECT DISTINCT YEARVALUE FROM AGGREGATEDATA ORDER BY YEARVALUE");
});

router.get('/getStates',function(req,res){
	getData(res,"SELECT STATE FROM LOCATION");
});

router.post('/getFilters',function(req,res){

   oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("SELECT QUESTION FROM FILTER, DISEASE WHERE SUBSTR(QUESTIONID, 1, 3)=DISEASEID AND DISEASE_DETAIL =:disease and FILTER.QUESTION like '%years%'",
        {disease: req.body.disease},
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.rows);

            res.send(result.rows);
            doRelease(connection);
            });   
      });
	
});

//query no.1 - index view

router.post('/getStateDataByRaceDiseaseYear',function(req,res){

	console.log("Calling function....");
	var bindvars = {
      stateidIn:  req.body.state,  // Bind type is determined from the data.  Default direction is BIND_IN
      diseasedetailIn: { val: req.body.disease, dir: oracledb.BIND_IN },
      yearIn:  { val:req.body.year, dir: oracledb.BIND_IN },
      stratificiationIn:{val:req.body.race,dir: oracledb.BIND_IN},
      avgdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      avglowdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      avghighdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("BEGIN SP_GET_STATE_DATA_BY_RDY(:stateidIn, :diseasedetailIn, :yearIn,:stratificiationIn, :avgdatavalueOut, :avglowdatavalueOut, :avghighdatavalueOut); END;",
		    bindvars,
		    function(err, result)
		      {
		        if (err) {
		          console.error(err.message);
		          doRelease(connection);
		          return;
		        }
		        //console.log(result.metaData);
		        console.log(result.outBinds);

		        res.send(result.outBinds);
		        doRelease(connection);
		      	});   
      });

});

function getData(res,query){
	oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute(query,
		    function(err, result)
		      {
		        if (err) {
		          console.error(err.message);
		          doRelease(connection);
		          return;
		        }
		        console.log(result.metaData);
		        console.log(result.rows);

		        res.send(result.rows);
		        doRelease(connection);
		      	});   
      });
}


//query no. 2 - disease view

router.post('/getFirstStateAverageDiseaseData',function(req,res){

  console.log("Calling function...."+req.body.firststate+" "+req.body.filter);
  var bindvars = {
      stateidIn:  req.body.firststate,  // Bind type is determined from the data.  Default direction is BIND_IN
      questionIn: { val: req.body.filter, dir: oracledb.BIND_IN },
      avgdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("BEGIN SP_GET_PREV_DOAGS(:stateidIn, :questionIn, :avgdatavalueOut); END;",
        bindvars,
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.outBinds);

            res.send(result.outBinds);
            doRelease(connection);
            });   
      });

});

router.post('/getSecondStateAverageDiseaseData',function(req,res){

  console.log("Calling function...."+req.body.secondstate+" "+req.body.filter);
  var bindvars = {
      stateidIn:  req.body.secondstate,  // Bind type is determined from the data.  Default direction is BIND_IN
      questionIn: { val: req.body.filter, dir: oracledb.BIND_IN },
      avgdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("BEGIN SP_GET_PREV_DOAGS(:stateidIn, :questionIn, :avgdatavalueOut); END;",
        bindvars,
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.outBinds);

            res.send(result.outBinds);
            doRelease(connection);
            });   
      });

});

//query no. 3 - disease view

router.post('/getLowHighDataValuesAcrossState',function(req,res){
  console.log("Calling function -state wise low high values for a disease in "+req.body.state);
   var bindvars = {
      stateidIn:  req.body.state,  // Bind type is determined from the data.  Default direction is BIND_IN
      avglowdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      avghighdatavalueOut:{ type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("BEGIN SP_GET_LOW_HIGH(:stateidIn, :avglowdatavalueOut,:avghighdatavalueOut); END;",
        bindvars,
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.outBinds);

            res.send(result.outBinds);
            doRelease(connection);
            });   
      });
});


//query no. 6 - index view (input: state)

router.post('/getAllRacesTableDataByState',function(req,res){
  console.log("Calling function -race-funding table data "+req.body.state);
     oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("SELECT S.STRATIFICATIONTYPE,((DT1.DIFF*100)+10000) AS FUNDINGNEEDED FROM (SELECT DT.SID ,SUM(DT.DT_2014-DT.DT_2013)AS DIFF FROM (SELECT * FROM (SELECT AD.YEARVALUE,AD.STRATIFICATIONID AS SID,AD.QUESTIONID AS QD_2014,AD.DATAVALUE AS DT_2014 FROM AGGREGATEDATA AD WHERE AD.YEARVALUE IN (2014) AND AD.STATEID=:state AND AD.DISEASEID = 'CKD'  AND AD.DATAVALUETYPEID= 'CrdPrev')T1 INNER JOIN  (SELECT AD.YEARVALUE,AD.STRATIFICATIONID AS SID,AD.DATAVALUE AS DT_2013,AD.QUESTIONID AS QD_2013 FROM AGGREGATEDATA AD WHERE AD.YEARVALUE IN (2013) AND AD.STATEID=:state AND AD.DISEASEID = 'CKD'  AND AD.DATAVALUETYPEID= 'CrdPrev')T2 USING (SID))DT WHERE DT.QD_2014 = DT.QD_2013 GROUP BY (SID))DT1, STRATIFICATION S WHERE DT1.SID = S.STRATIFICATIONID",
        {state: req.body.state},
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.rows[0]);
            var array=new Array(result.rows.length);
            for(var i=0;i<result.rows.length;i++){
              array[i] = result.rows[i];
              
            }

            
            res.send(array);
            doRelease(connection);
            });   
      });
});


//query no. 7 - index view

router.post('/getLeastCommonDiseasesByStateAndYear',function(req,res){
  console.log("Calling function -least common three diseases "+req.body.state+" "+req.body.year);
     oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("select * from table(PACKAGE3.F_GET_LEAST_COM(:state,:year))",
        {state: req.body.state,
          year:req.body.year},
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.rows);
            var array=new Array(result.rows.length);
            for(var i=0;i<result.rows.length;i++){
              array[i] = result.rows[i];
              
            }

            
            res.send(array);
            doRelease(connection);
            });   
      });
});

//user view queries below
//query no. 8 - user view

 router.post('/getProfitLossPerState',function(req,res){
  console.log("Calling function -profit loss function"+req.body.disease+" "+req.body.race);
     oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("select * from table(PACKAGE4.F_PROLOSS(:disease,:race))",
        {disease: req.body.disease,
          race:req.body.race},
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.rows);
            var array=new Array(result.rows.length);
            for(var i=0;i<result.rows.length;i++){
              array[i] = result.rows[i];
              
            }

            
            res.send(array);
            doRelease(connection);
            });   
      });
});

//query no. 4 - user view
router.post('/getTopFiveStates',function(req,res){
    console.log("Calling function - top 5 states"+req.body.disease+" "+req.body.filter);
     oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }

        connection.execute("select * from table(PACKAGE5.F_GET_ACROSS(:disease,:filter))",
        {disease: req.body.disease,
          filter:req.body.filter},
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            //console.log(result.metaData);
            console.log(result.rows);
            var array=new Array(result.rows.length);
            for(var i=0;i<result.rows.length;i++){
              array[i] = result.rows[i];
              
            }

            
            res.send(array);
            doRelease(connection);
            });   
      });
});


router.get('/getTotalRecords',function(req,res){
    oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }
        
        connection.execute("SELECT * FROM TABLE(PACKAGE6.F_COUNT_ALL(1))",
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            console.log(result.metaData);
            console.log(result.rows);
            var array=new Array(result.rows.length);
            for(var i=0;i<result.rows.length;i++){
              array[i] = result.rows[i];
              
            }
            res.send(array);
            doRelease(connection);
            });   
      });
});


//login
router.post('/login',function(req,res){
    console.log("logging function...."+req.body.email+" "+req.body.password);
        oracledb.getConnection(  // gets a connection from the 'default' connection pool
      function(err, connection)
      {
        if (err) {
          console.error("Error in getting connection: "+err.message);
          return;
        }
        
        connection.execute("select count(*) from USERS WHERE EMAIL=:u AND PASS= :p",
        {u:req.body.email,
          p: req.body.password},
        function(err, result)
          {
            if (err) {
              console.error(err.message);
              doRelease(connection);
              return;
            }
            console.log(result.metaData);
            console.log(result.rows);
            // var array=new Array(result.rows.length);
            // for(var i=0;i<result.rows.length;i++){
            //   array[i] = result.rows[i];
              
            // }
            res.send(result.rows);
            doRelease(connection);
            });   

      });
    
});
 
module.exports = router;
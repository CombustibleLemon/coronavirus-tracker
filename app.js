// app.js
// load the things we need
var express = require('express');
var app = express();
var path = require('path')
app.use(express.static(path.join(__dirname, 'public')));

var serverCountList;

console.log("Loading pg")
const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
})
// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

pool.query('SELECT * FROM minecraft', (err, res) => {
  if (err) {
    throw err
  }
  // console.log('Building list:', res)
  serverCountList = res.rows
})

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
	res.writeHead(307, {
		'Location': '/minecraft/graphs'
	});
	response.end();
}

app.get('/minecraft/graphs', function(req,res) {
// async/await - check out a client
  ;(async () => {
    const client = await pool.connect()
    try {
      const res = await client.query('SELECT * FROM minecraft')
      serverCountList = res.rows
      console.log()
    } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release()
    }
  })().catch(err => console.log(err.stack))

    res.render('pages/minecraft/graphs',{
	    count : serverCountList,
    });
});

// about page
// app.get('/about', function(req, res) {
//     res.render('pages/about');
// });

const port = process.env.PORT || 80;
app.listen(port);

console.log("Server running at http://localhost:%d", port);

var express    = require('express');
var pg         = require('pg');
var bodyParser = require('body-parser');

var client = new pg.Client('postgres://localhost:5432/todo');
var app    = express();

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function redirect (res) {
  return function (err, results) {
    res.redirect('/');
  };
}

// connect to our database
client.connect(function (err) {
  if (err) throw err;

  // READ
  app.get('/', function (req, res) {
  	client.query('SELECT * FROM todos ORDER BY date DESC', function (err, result) {
      res.render('index', {todos: result.rows});
  	});
  });

  // CREATE
  app.post('/add', function (req, res) {
    var query = 'INSERT INTO todos (name, complete, date) VALUES ($1, $2, $3);';

    client.query(query, [req.body.name, false, new Date().toISOString()], redirect(res));
  });

  // UPDATE
  app.post('/complete', function (req, res) {
    var query = 'UPDATE todos SET complete = true WHERE name = $1';

    client.query(query, [req.body.name], redirect(res));
  });

  // DELETE
  app.post('/delete', function (req, res) {
    var query = 'DELETE FROM todos WHERE name=$1';

    client.query(query, [req.body.name], redirect(res));
  });

  app.listen(8080, function () {
    console.log('PostgreSQL TODO up and running on port 8080!')
  });
});

process.on('exit', function (code) {
	client.end(function (err) {
		if (err) throw err;
    else console.log('Shutdown postgres successfully.');
	});
});
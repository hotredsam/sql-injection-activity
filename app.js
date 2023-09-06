const http = require('http'),
  path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.static('.'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

db.serialize(function () {
  db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
  db.run("INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')");
  db.run("INSERT INTO user VALUES ('anotherUser', 'anotherPassword', 'User')");
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(`Received username: ${username}`);
  console.log(`Received password: ${password}`);

  const query = `SELECT title FROM user WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Final SQL Query:', query);

  db.get(query, function (err, row) {
    if (err) {
      console.log('Raw SQL Query:', query);
      console.log('SQL Error:', err.message);
      res.redirect("/index.html#error");
    } else if (!row) {
      res.redirect("/index.html#unauthorized");
    } else {
      res.send(`Hello <b>${row.title}</b><br />This file contains all your secret data:<br /><br />SECRETS<br /><br />MORE SECRETS<br /><br /><a href="/index.html">Go back to login</a>`);
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000/');
});

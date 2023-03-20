const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'testing'
});

connection.connect((err) => {
    if (err) {
        console.log('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//insert data
app.post('/objectInsert', (req, res) => {
    const data = req.body;
    const query = 'INSERT INTO objects(name,baseType,position,rotation,roomName,floor) VALUES (?,?,?,?,?,?)';
    connection.query(query, [data.name, data.baseType,data.position, data.rotation,data.roomName, data.floor], (err, results, fields) => {
        if (err) {
            console.log('Error inserting data:', err);
            res.status(500).send('Error inserting data');
            return;
        }
        console.log('Data inserted:', results);
        res.send('Data inserted');
    });
});

// update data
app.post('/objectUpdate', (req, res) => {
  const data = req.body;

  const query='UPDATE objects SET position= ? ,rotation= ?, roomName= ?,floor= ?  WHERE name = ?';
  connection.query(query, [data.position, data.rotation,data.roomName,data.floor, data.name], (err, result) => {
    if (err) throw err;
    console.log('Data updated successfully');
  });
});


// retrieve data
app.get('/get', (req, res) => {
  connection.query('SELECT * FROM mytable', (err, result) => {
    if (err) throw err;
    console.log("Data recieved",result);
    res.send(result);
  });
});

// delete data
app.post('/objectDelete', (req, res) => {
  const data = req.body;
  const query='DELETE FROM objects WHERE name = ?';
  connection.query(query, [data.name], (err, result) => {
    if (err) throw err;
    console.log('Data Deletion successfully');
  });
});



//Walls////////////////////////////////////////////////////

//insert data
app.post('/wallInsert', (req, res) => {
    const data = req.body;
    const query = 'INSERT INTO walls(name,v1,v2,v3,v4) VALUES (?,?,?,?,?)';
    connection.query(query, [data.name, data.v1,data.v2, data.v3,data.v4], (err, results, fields) => {
        if (err) {
            console.log('Error inserting data:', err);
            res.status(500).send('Error inserting data');
            return;
        }
        console.log('Data inserted:', results);
        res.send('Data inserted');
    });
});

// update data
app.post('/wallUpdate', (req, res) => {
  const data = req.body;

  const query='UPDATE walls SET name=? WHERE name = ?';
  connection.query(query, [data.newname,data.oldname], (err, result) => {
    if (err) throw err;
    console.log('Data updated successfully');
  });
});

// delete data
app.post('/wallDelete', (req, res) => {
  const data = req.body;
  const query='DELETE FROM walls WHERE name = ?';
  connection.query(query, [data.name], (err, result) => {
    if (err) throw err;
    console.log('wall Deletion successfully');
  });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

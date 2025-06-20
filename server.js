const express = require('express');
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dbPath = path.join(__dirname, 'websiteLerners.db')
const app = express();

app.use(express.json());

let db;

const initilizeDbAndServer = async () => {
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })

        app.listen(3000, () => {
            console.log('Server has started on port 3000')
        })

    } catch(e){
        console.log(e)
        process.exit(1)
    }
}

initilizeDbAndServer()

app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        users (username, password, role) 
      VALUES 
        (
          '${username}',
          '${hashedPassword}', 
          '${role}'
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    res.status(201);
    res.send({
      message: `User registered successfully with userId : ${newUserId}`
    })
  } else {
    res.status = 400;
    res.send("User already exists");
  }
});


app.post('/signin', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const getUser = `SELECT * FROM users WHERE username = '${username}'`;
   
    const user = await db.get(getUser)
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: `User is not a ${role}` });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401);
      res.send({
        error: 'Invalid password'
      })
    }else{
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        'SECRET_KEY',
        { expiresIn: '1h' }
      );
      res.status(200)
      res.send({
        message: 'Login Successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      })
    }
});


function authenticateToken(req, res, next) {
  const SECRET_KEY = 'SECRET_KEY';
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });

    req.user = user; 
    next();
  });
}

function authorizeRole(role) {
  return function (req, res, next) {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied: ${role} role required.` });
    }

    next();
  };
}

const onlyPatient = authorizeRole('patient');
const onlyCaretaker = authorizeRole('caretaker');

module.exports = {
  authenticateToken,
  onlyPatient,
  onlyCaretaker
};

app.post('/medications', authenticateToken, onlyPatient, async (req, res) => {
    const {name, dosage, frequency} = req.body
    const userId = req.user.id

    if(!name || !dosage || !frequency){
        return res.status(400).json({ error: 'All fields are required' });
    }

    const getMedication = `SELECT * FROM medications 
       WHERE user_id = ${userId} AND name = '${name}' AND dosage = '${dosage}' AND frequency = '${frequency}'
    `;

    const existing = await db.get(getMedication);

    if(!existing){
      const insertQuery = `
        INSERT INTO medications (user_id, name, dosage, frequency)
        VALUES (${userId}, '${name}', '${dosage}', '${frequency}')
      `;

      const medication = await db.run(insertQuery)
      res.status(201);
      res.send({
        message: 'Medication added successfully',
        medicationId: medication.lastID,
        userId
      })
    }else{
      res.status(400)
      res.send({
        message: 'Medication already exist'
      })

    }
})

app.get('/medications', authenticateToken, onlyPatient, async (request, response) => {
  const userId = request.user.id;
  console.log(userId)
  const query = `SELECT * FROM medications WHERE user_id = ${userId}`;

  const getMedications = await db.all(query)
  console.log(getMedications)
  response.send({
    medications: getMedications
  })
});

app.post('/medications/:id/taken', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const medicationId = req.params.id;
  const {date} = req.body;
  
  const takenDate = date || new Date().toISOString().split('T')[0];

  const getDate = `SELECT * FROM medication_logs WHERE user_id = ${userId} AND medication_id = ${medicationId} AND date_taken = '${takenDate}'`;
  const existing = await db.get(getDate);

  if (existing) {
    return res.status(409).json({ error: 'Already marked as taken for this date' });
  }

  const insertQuery = `
    INSERT INTO medication_logs (user_id, medication_id, date_taken) VALUES (${userId}, ${medicationId}, '${takenDate}')
  `;

  await db.run(insertQuery);

  res.status(201);
  res.send({
    message: 'Marked as taken', date: takenDate
  });
});


app.get('/medications/adherence', authenticateToken, onlyPatient, async (req, res) => {
  
  const frequencyMap = {
    "Once a day": 1,
    "Twice a day": 2,
    "Three times a day": 3,
    "Every 8 hours": 3,
    "Every 12 hours": 2,
  };
  
  const userId = req.user.id;

  const medications = await db.all(
    `SELECT * FROM medications WHERE user_id = ${userId}`
  );

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 6); // last 7 days
  const fromDateStr = startDate.toISOString().split('T')[0];

  const results = [];

  for (const med of medications) {
    const freqPerDay = frequencyMap[med.frequency] || 1;
    const expected = freqPerDay * 7;

    const logs = await db.all(
      `SELECT * FROM medication_logs
        WHERE user_id = ${userId} AND medication_id = ${med.id} AND date_taken >= '${fromDateStr}'`,
    );

    const taken = logs.length;
    const adherence = expected === 0 ? 0 : Math.min((taken / expected) * 100, 100);

    results.push({
      medication: med.name,
      taken,
      expected,
      adherence: Number(adherence.toFixed(2)) 
    });
  }

    res.json(results);
});
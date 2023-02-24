import bodyParser from "body-parser";
import express from "express";
import users from './db/users.json';
import reservations from './db/reservations.json';
import { writeFile } from 'fs/promises'
const cors = require('cors')
// import pg from "pg";

// Connect to the database using the DATABASE_URL environment
//   variable injected by Railway
// const pool = new pg.Pool();

console.log(reservations.forEach);
const app = express();
const port = process.env.PORT || 3333;

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

// const { rows } = await pool.query("SELECT NOW()");
app.get("/users", async (req, res) => {
  res.json(users);
});

app.get("/users/:dni", async (req, res) => {
  const { dni }: any = req.params
  const user = users.find(u => u.dni === dni)
  if(!user){
    return res.status(404).json({
      "message": "User not found"
    })
  }
  res.json(user);
});

app.post("/users", async (req, res) => {
  const { name, dni, email, birthday, number  } = req.body
  if(users.some(u => u.dni === dni)){
    return res.status(409).json({
      "message": "User already exists"
    })
  }
  const user = { name, dni, email, birthday, number }
  users.push(user)
  await writeFile('./src/db/users.json', JSON.stringify(users))
  res.json(user);
});

// app.get("/reservations/:dni", async (req, res) => {
//   const { dni  } = req.params
//   const reservation = reservations.some((r: any) => r.dni === dni)
//   if(reservation){
//     return res.json(reservation)
//   }
//   return res.status(404).json({message: "reservation not found"})
// });

app.post("/reservations", async (req, res) => {
  const { dni, date  } = req.body

  let isNew = false
  let reservation = reservations.find((r: any) => {

    return r.dni === dni && r.date === date
  })
  
  
  if(!reservation){
    reservation = {
      id: new Date().getTime(),
      dni,
      date,
      hash: new Date().getTime()
    }
    reservations.push(reservation)
    isNew = true
  }

  await writeFile('./src/db/reservations.json', JSON.stringify(reservations))
  res.json({reservation, isNew});
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});


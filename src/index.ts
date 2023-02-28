import bodyParser from "body-parser";
import express from "express";
import usersJson from './db/users.json';
import reservationsJson from './db/reservations.json';
import { writeFile } from 'fs/promises'
import { User } from './interfaces/User';
import { Reservation } from './interfaces/Reservation';
const cors = require('cors')

const users: User[] = usersJson
const reservations: Reservation[] = reservationsJson
const app = express();
const port = process.env.PORT || 3333;

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/", async (req, res) => {
  return res.json({message: "Hello World"})
});

app.get("/users", async (req, res) => {
  const response = users.map((u: any) => {
    const numberOfReservations = reservations.filter((r: any) => {
      return r.dni === u.dni
    }).length
    return {
      ...u,
      numberOfReservations
    }
  })
  res.json(response);
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

app.get('/reservations', (req, res) => {
  const {date} = req.query
  const response = reservations
  .filter((r: any) => {
    return date ? r.date === date : true
  })
  .map((r: any) => {
    const user = users.find((u: any) => u.dni === r.dni)
    return {
      ...r,
      user
    }
  })
  res.json(response)
})

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


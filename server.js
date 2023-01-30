

const express = require('express');
const app = express()
const path = require('path');
const mysql = require('mysql2')

require('dotenv').config({path:'./.env'})
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.set('views', path.join(__dirname, "views"));
app.set('view engine','ejs');

const connection = mysql.createConnection({
    host:'localhost',
    user:'mysql',
    password:'password',
    database:'evemarketreader'
})

connection.connect((err)=>{if (err) throw err; console.log('MySQL server connected.');})


app.get('/', (req, res) => {res.sendFile(path.join(__dirname, '/views/index.html'))});
const authRouter = require('./routes/auth')
app.use('/auth', authRouter)
const callbackRouter = require('./routes/callback')
app.use('/callback', callbackRouter)
const homeRouter = require('./routes/home')
app.use('/home', homeRouter)
const sdeRouter = require('./routes/sde')
app.use('/sde', sdeRouter)

app.listen(3000);
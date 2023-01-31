const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const connection = mysql.createConnection({
    host:'localhost',
    user:'mysql',
    password:'password',
    database:'evemarketreader'
})

function queryFunction(err, response)
{
    if (err) throw err;
}

var searchString = '11394' //at this point the typeID will always be a blueprint_typeID
var query =
`
    SELECT typeID, groupID, typeName
    FROM invTypes
    WHERE invTypes.typeID = ${searchString}
`
connection.connect((err)=>
{
    if (err) throw err;
    console.log('MySQL server connected.');
})

router.get('/',(req, res)=>
{
    connection.query(query,(err, result)=>
    {
        if (err) throw err;
        console.log(result)
        res.send(result)
    })
})
module.exports = router
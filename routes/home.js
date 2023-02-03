const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const connection = mysql.createConnection({
    host:'localhost',
    user:'mysql',
    password:'password',
    database:'evemarketreader'
})

var searchString = '11394' //at this point the typeID will always be a blueprint_typeID

connection.connect((err)=>
{
    if (err) throw err;
    console.log('MySQL server connected.');
})
async function get_blueprintTypeID(blueprint_typeID)
{
    let result = await new Promise((resolve, reject)=>
    {
        
        connection.query(`SELECT typeID as blueprint_typeID FROM industryActivityProducts WHERE productTypeID=${blueprint_typeID}`, (err,result)=>
        {
            if (err) reject(err)
            else
            {
                if(result[0] === undefined){
                    resolve('material') 
                }
                else resolve(result[0].blueprint_typeID); 
            }
        })
        
    })
    return result;
}

async function get_material_TypeID(blueprint_typeID)
{
    let result = await new Promise((resolve,reject)=>
    {
        connection.query(`SELECT * FROM industryActivityMaterials WHERE typeID=${blueprint_typeID} and activityID=1`, (err,result)=>
        {
            if (err) reject(err)
            else{resolve(result)}
        })
    })
    for (material in result)
    {
        result[material].blueprint = await get_blueprintTypeID(Number(result[material].materialTypeID))
    }
    return result;
}

router.get('/',async (req, res)=>
{
    let result = await get_material_TypeID(searchString)
    //let result = await get_blueprintTypeID(11399)
    res.send(result)
})
module.exports = router
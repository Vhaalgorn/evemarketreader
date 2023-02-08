const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

const connection = mysql.createConnection({
    host:'localhost',
    user:'mysql',
    password:'password',
    database:'evemarketreader'
})
var searchString = [{blueprint_typeID:12024}] //at this point the typeID will always be a blueprint_typeID
var searchString2 = 28711
connection.connect((err)=>{if (err) throw err; console.log('MySQL server connected.')})

async function get_blueprintTypeID(item_typeID){
    let result = await new Promise((resolve, reject)=>{
        connection.query(`SELECT industryActivityProducts.typeID as blueprint_typeID FROM industryActivityProducts inner join invTypes on industryActivityProducts.typeID=invTypes.typeID WHERE productTypeID=${item_typeID} and invTypes.published = 1`, (err,result)=>{
            if (err) reject(err)
            else{
                if(result[0] === undefined){resolve('material')}
                else resolve(result[0].blueprint_typeID); 
            }
        })
    })
    return result;
}

async function get_material_TypeID(blueprint_typeID){
    //returns a object containing all item_typeID for needed for blueprint_typeID
    let result = await new Promise((resolve,reject)=>{
        connection.query(`

        SELECT invTypes.typeID, invTypes.groupID, invTypes.typeName, invGroups.groupName, industryActivityMaterials.materialTypeID, industryActivityMaterials.quantity, industryActivityProducts.productTypeID
        FROM invTypes
        inner join industryActivityMaterials on invTypes.typeID=industryActivityMaterials.typeID
        inner join industryActivityProducts on invTypes.typeID=industryActivityProducts.typeID
        inner join invGroups on invTypes.groupID = invGroups.groupID
        where invTypes.published = 1 and industryActivityMaterials.activityID = 1 and invTypes.typeID = ${blueprint_typeID} or invTypes.published = 1 and industryActivityMaterials.activityID = 11 and invTypes.typeID = ${blueprint_typeID};`, (err,result)=>{
            if (err) reject(err)
            else{resolve(result)}
        })
    })
    
    //converts item_typeID in the object and returns a (number) blueprint_typeID of that item. 
    for (let material in result){
        result[material].blueprint_typeID = await get_blueprintTypeID(Number(result[material].materialTypeID))
    }
    return result;
}

async function iterateObj(obj)
{
    let result = await get_material_TypeID(obj)
    
    
    for (let item in result)
    {
        if(result[item].blueprint_typeID=='material'){}
        else
        {
            
            result[item].blueprint_typeID = await iterateObj(result[item].blueprint_typeID)
            //console.log(result[item].blueprint_typeID)
        }
        
    }

    return result
}


router.get('/',async (req, res)=>
{
    //let result = await iterateBranch(searchString)
    //let result = await get_blueprintTypeID(11393)
    let result = await iterateObj(searchString2)
    //let result = await get_material_TypeID(11394)
    //let result = await get_data(11394)
    //console.log(result)
    res.end(JSON.stringify(result, null, 3));
})
module.exports = router
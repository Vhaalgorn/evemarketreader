const express = require('express');
const mysql = require('mysql2');
const router = express.Router();


const connection = mysql.createConnection({
    host:'localhost',
    user:'mysql',
    password:'password',
    database:'evemarketreader'
})

connection.connect((err)=>{if (err) throw err; console.log('MySQL server connected.')})

async function get_blueprintTypeID(item_typeID){
    let result = await new Promise((resolve, reject)=>{
        connection.query(`
            SELECT industryActivityProducts.typeID as blueprint_typeID 
            FROM industryActivityProducts
            inner join invTypes on industryActivityProducts.typeID = invTypes.typeID
            WHERE productTypeID=${item_typeID} and invTypes.published = 1`, (err,result)=>{
                if (err) reject(err)
                else{
                    if(result[0] === undefined){resolve(null)}
                    else resolve(result[0].blueprint_typeID); 
                }
            }
        )
    })
    return result;
}
async function get_material_TypeID_v3(blueprint_typeID){
    //returns a object containing all item_typeID for needed for blueprint_typeID
    let result = await new Promise((resolve,reject)=>{
        connection.query(`
            SELECT
                invTypes.typeID, 
                invTypes.groupID,
                invTypes.typeName,
                invGroups.groupName,
                industryActivityMaterials.materialTypeID,
                industryActivityMaterials.quantity,
                industryActivityProducts.productTypeID,
                industryActivityProducts.quantity as 'pro_quantity'
            FROM invTypes
            inner join industryActivityMaterials on invTypes.typeID=industryActivityMaterials.typeID
            inner join industryActivityProducts on invTypes.typeID=industryActivityProducts.typeID
            inner join invGroups on invTypes.groupID = invGroups.groupID
            WHERE 
                invTypes.published = 1 and industryActivityMaterials.activityID =1 and invTypes.typeID = ${blueprint_typeID}
                or
                invTypes.published = 1 and industryActivityMaterials.activityID =11 and invTypes.typeID = ${blueprint_typeID};`,
            (err,result)=>{
                if (err) reject(err)
                else{resolve(result)}
            }
        )
    })
    
    //converts item_typeID in the object and returns a (number) blueprint_typeID of that item. 
    for (let material in result){
        result[material].blueprint_typeID = await get_blueprintTypeID(Number(result[material].materialTypeID))
    }
    return result;
}
async function iterateObj(obj){
    let result = await get_material_TypeID_v3(obj)
    for (let item in result){
        if(result[item].blueprint_typeID=='material'){}
        else{
            result[item].blueprint_typeID = await iterateObj(result[item].blueprint_typeID)
        }
    }
    return result
}

async function processObj(obj, multiplier, processedResults){
    
    for (let item in obj){
        if (Object.keys(obj[item].blueprint_typeID)==0){
            if(!processedResults[obj[item].materialTypeID]){
                processedResults[obj[item].materialTypeID]= Math.ceil(obj[item].quantity*multiplier/obj[item].pro_quantity)
            }
            else{
                processedResults[obj[item].materialTypeID]= processedResults[obj[item].materialTypeID] + Math.ceil(obj[item].quantity*multiplier/obj[item].pro_quantity)
            }
        }
        else{
            multiplier = multiplier * obj[item].quantity / obj[item].pro_quantity
            processObj(obj[item].blueprint_typeID,multiplier,processedResults)
            multiplier = multiplier / obj[item].quantity * obj[item].pro_quantity
        }
    }
}

async function initialize (){
    let multiplier = 1;
    let processedResults = {}
    let result = await iterateObj(11394)
    //console.log(JSON.stringify(result, null, 3))
    processObj(result, multiplier, processedResults)
    console.log(processedResults)
    return result
}




router.get('/',async (req, res)=>
{
    var result = await initialize();
    res.end(JSON.stringify(result, null, 3));
})

module.exports = router
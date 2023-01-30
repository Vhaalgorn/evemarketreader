const express = require('express');
const router = express.Router();

async function pulldata()
{
    let response = await fetch('https://www.fuzzwork.co.uk/dump/mysql56-sde-20230118-TRANQUILITY.tbz2')   
    let json_response = await response.json().then(console.log('Download complete')); //async

}

router.get('/',(req, res)=>{res.send('hello')})
module.exports = router;
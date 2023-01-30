const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const url = 'https://login.eveonline.com/v2/oauth/token';
const options =
{
    method:'POST',
    headers:
    {
        'authorization':'Basic '+ process.env.ENV_PASS,
        'Content-Type':'application/x-www-form-urlencoded',
        'host':'login.eveonline.com'
    },
    body:''
}

async function fetchRequest (req, res)
{
    options.body =`grant_type=authorization_code&code=${req.query.code}`
    let response = await fetch(url,options,{credentials:'include'}) //asinc
    let json_response = await response.json(); //asinc
    res.cookie('my_refresh_token', json_response.refresh_token)
    res.cookie('my_access_token', json_response.access_token)
    res.redirect('http://localhost:3000/home')
}

//router.get('/',send_get_request)
router.get('/',fetchRequest)
module.exports = router;
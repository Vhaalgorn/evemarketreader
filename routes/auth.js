const express = require('express');
const router = express.Router();

const authUrl = 'https://login.eveonline.com/v2/oauth/authorize/';
const redirectUrl = 'http://localhost:3000/callback/';            
const query = {
    response_type: 'code',
    redirect_uri: redirectUrl,
    client_id: process.env.ENV_CLIENTID,
    scope: process.env.ENV_SCOPES,
    state: '102'
};

const queryStr = new URLSearchParams(query).toString();
url = authUrl+'?'+queryStr;
router.get('/',(req,res) =>{res.redirect(url)});

//console.log(__dirname);

module.exports = router;
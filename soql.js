/**
 * @fileoverview Functions for fetching a SFDC access token and then issuing a SOQL query over REST.
 * @author Joey Whelan <joey.whelan@gmail.com>
 */

'use strict';
'use esversion 6';

const AUTH_URL='https://login.salesforce.com/services/oauth2/token';
const QUERY_URL=`https://${INSTANCE}.salesforce.com/services/data/v20.0/query/?q=`;
const QUERY='SELECT Name,Phone FROM Account ORDER BY Name';
const fetch = require('node-fetch');

function formEncode(data) {
    return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');  
}

async function getToken() {
    const body = {
        grant_type: 'password',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD
    };

    const response = await fetch(AUTH_URL, {
        method: 'POST',
        body: formEncode(body),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    })
    if (response.ok) {
        const json = await response.json();
        return json.access_token;
    }
    else {
        const msg = `getToken() response status: ${response.status} ${response.statusText}`;
		throw new Error(msg);
    }
}

async function sendQuery(query, token) {

    const response = await fetch(QUERY_URL + encodeURIComponent(query), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    if (response.ok) {
        return await response.json();
    }
    else {
        const msg = `sendQuery() response status: ${response.status} ${response.statusText}`;
		throw new Error(msg);
    }

}


(() => {
    getToken()
    .then((token) => {
        return sendQuery(QUERY, token);
    })
    .then((data) => {
        console.log(JSON.stringify(data, null, 4));
    })
    .catch((err) => {
        console.error(err);
    });
})();

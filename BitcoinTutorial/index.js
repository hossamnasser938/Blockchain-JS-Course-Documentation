const express = require( "express" );
const request = require( "request" );
const app = express();

const bitcore = require( "bitcore-lib" );

const bodyParser = require( "body-parser" );

app.use( bodyParser.urlencoded( {
    extended: true
} ) );

app.use( bodyParser.json() );

app.set( "view engine", "ejs" );

app.get( "/", ( req, res ) => {
    res.sendFile( __dirname + "/index.html" );
} );

app.post( "/wallet", ( req, res ) => {
    // parse the form body
    const body = req.body; 
    // extract user input
    const brainsrc = body.brainsrc;
    // convert it into Buffer    
    const input = new Buffer( brainsrc );
    // Hash it
    const hash = bitcore.crypto.Hash.sha256( input );
    // Generate a big number
    const bn = bitcore.crypto.BN.fromBuffer( hash );
    // Generate Bitcoin address and Private Key
    const privateKey = new bitcore.PrivateKey( bn ).toWIF();
    const publicAddress = new bitcore.PrivateKey( bn ).toAddress();
    // Send the result to the user
    res.send( "The Brain Wallet for: " + brainsrc 
        + "<br>address: " + publicAddress  
        + "<br>key: " + privateKey );
} );

getBTCToUSD = ( callback ) => {
    request({
        url: "https://blockchain.info/ticker",
        json: true
    }, ( error, response, body ) => {
        const btcToUSD = body.USD.last;
        callback( btcToUSD );
    });
}

app.get( "/converter", ( req, res ) => {
    getBTCToUSD( ( btcToUSD ) => {
        res.render( "converter", { btcToUSD } );
    } );
} );

app.listen( 5000, () => console.log( "A new user" ) );
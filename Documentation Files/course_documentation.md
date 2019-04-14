# Blockchain js

## Creating a Blockchain with JavaScript
* Let's create a very basic **blockchain**. A **blockchain** that just demonstrates what a **blockchin** is.

* First let's define what a **blockchain** is in its simplest form.

* A **blochchain** is just a **chain** of **tranasctions**.
    * By a **chain** I mean a list that its elements, which are **transactions**, not only ordered but also **chained** to each other. Like the idea of a **linked list**. The main difference here, at lest for me till now, is that the elements of a **bloch chain** are chained in a way that enforces a constraint that once a **transaction** is pushed into the **chain**, it can not be updated neither removed. Doing so violates the **integrity** of a **block chain** and it must be easily detected.
    
    * By a **transaction** I mean any operation that must be legally registered. A **transaction** has many definitions based on the **context** in which it is used. For exmple in **finance**, a **transction** means a transfer of cash or a property between 2 or more parties.

* One way to **chain** some transactions is by using a **hash** function. A **hass function** is just a function that accepts a record and returns a **hash value** based on that given record. A good **hash function** must generate the same hash value for any identical records and generate 2 different **hash values** for any 2 different records. For simplicity, if we have a **hash function** named ` tek_hash `. If ` tek_hash ` is passed this recdord:
```js
{
    amount: 4,
    buyer: "Ahmed",
    seller: "Hossam"
}
```
multiple times in different timestmps, it must generate the same **hash value** while if it is given a record like this:
```js
{
    amount: 70,
    buyer: "Ahmed",
    seller: "Hossam"
}
```
which is basically the same record as the previous one except for the ` amount ` changed from ` 4 ` to ` 70 `, it must generate a different **hash value** than the one generated for for the previous record.

* Now we understand what a **hash function** is, let's see how we use it to **chain** transctions. 
    1. Once a **transaction** is pushed to the **block chain**, the **transaction** info is passed to the **hash function** to calculate a **hash value** for it. This **hash value** is stored with the **transaction** in the **block chain**. 
    
    2. In addition to that, any **transaction** keeps trasck of the **hash value** of its preceding **transaction**.

* These 2 points provides a way to check the **integrity** of the **block chain**. We have 2 operations that **violate** the **integrity** of a **blocjk chain**:
    * **Update**  
    If an update occurs on a **transction**, it can be easily detected by recalculating the **hash value** of the **transaction** and comparing it with the **hash value** stored there. If an update occurred, they will be 2 different things. What if the bad guy updtes both the **transaction** data as well as its **hash value**? This also can be detected by comparing the **hash value** of the malicious **transaction** with the value stored in the next **transaction**[Because each **transaction** keeps record of its preceding **transaction** **hash value**].
    
    * **Removal**  
    If a **transaction** is removed, it can be esily detected because the next **trnsaction** to it will not hold the **hash value** of its preceding **transaction** any more.

* Now we have the idea of what we are bout to build sol let's start. We will follow an **object-oriented** approach to represent a simple **bloch chain**. 
    1. Let's start by defining what a **block** in a **bloch chain** looks like? We define a ` class ` named ` Block ` that has:
        * ` constructor ` that accepts:
            * ` index ` to represent where this **block** is located in the **chain**.
            * ` timestamp ` to represent at which point of time this **block** was pushed into the **chain**.
            * ` data ` to represent the **transaction** itself which may seem like the previous records we used to define what  **hash function** is.
            * ` prevHash ` to represent the **hash value** of the preceding **transaction**.
            * We also need to calculate the **hash value** of the **transaction**. For that we will use a third-party **hash function** named ` sha256 ` which can be installed by hitting ` npm install --save crypto-js `.  
        
        * ` calculateHash ` method in which we use the ` sha256 ` **hash function** with the properties of the **block** to generate a **hash value**.   
    
    ```js
    const sha256 = require( "crypto-js/sha256" );

    class Block {
        constructor( index, timestamp, data, prevHash = "" ) {
            this.index = index;
            this.timestamp = timestamp;
            this.data = data;
            this.prevHash = prevHash;
            this.hash = this.calculateHash();
        }

        calculateHash() {
            return sha256( 
                this.index
                + this.timestamp 
                + JSON.stringify( this.data ) 
                + this.prevHash 
             ).toString();
        }
    } 
    ```

    2. Then we define what a **block chain** looks like? We define a ` class ` named ` SimpleBlockChain ` that has:
        * a ` constructore ` that just initializes the **block chain** which is simply an ` Array `.
        * a method named ` createGenesisBlock ` to create the first **block**. The first **block** is called the **Genesis Block** and usually it is created manually.
        * a method named ` getLastBlock ` which normally returns the last **block** in the **chain**. That will be useful in pushing a new **block** because there we need the last **block** **hash value**.
        * a method named **addBlock** that normally pushes a new **block** to the **chain** after assigning to it the ` prevHash `[That's why we used **default arg** with ` prevHash `] and recalculate the ` hash ` of it.

    ```js
    class SimpleBlockChain {
        constructor() {
            this.chain = [ this.createGenesisBlock() ];
        }

        createGenesisBlock() {
            return new Block( 0, "01/01/2019", "Genesis Block", "0" );
        }

        getLastBlock() {
            return this.chain[ this.chain.length - 1 ];
        }

        addBlock( newBlock ) {
            newBlock.prevHash = this.getLastBlock().hash;
            newBlock.hash = newBlock.calculateHash();
            this.chain.push( newBlock ); 
        }
    }
    ```

    3. Finally let's provide a way to **validate** our **block chain**. In ` SimpleBlockChain ` ` class ` we define a function named ` isChainValid ` to return either ` true ` if the chin is valid or ` false ` if not. In ` isChainValid ` we simply make sure that:
        * Each **block** ` hash ` still represents the **block** which means no **update** occurred on that **block**. We do that by, simply, recalculate the ` hash ` of the **block** and compare it with the one exists there.
        * Each **block** still has the ` prevHash ` of its preceding **block** which mens no **removal** occurred.
    ```js
    isChainValid() {
        for ( let i = 1; i < this.chain.length; i++ ) {
            let currentBlock = this.chain[i];
            let prevBlock = this.chain[i - 1];

            if ( currentBlock.hash !== currentBlock.calculateHash() ) {
                return false;
            }

            if ( currentBlock.prevHash !== prevBlock.hash ) {
                return false;
            }
        }

        return true;
    }  
    ```

    * Now we can test our **block chain**
        1. Let's check the validity of the **block chain** before nd fter and update on a **block**.
        ```js
        const bc = new SimpleBlockChain();
        bc.addBlock( new Block( 1, "10/01/2019", { amount: 20 } ) );
        bc.addBlock( new Block( 2, "12/01/2019", { amount: 50 } ) );

        console.log( "is block chain valid?", bc.isChainValid() );

        bc.chain[1].data = { quantity: 31 };

        console.log( "is block chain valid?", bc.isChainValid() );
        ```
        ```js
        is block chain valid? true
        is block chain valid? false
        ```
        Great, works perfectly.
        2. Let's be clever and update the ` hash ` after updating the **block**.
        ```js
        const bc = new SimpleBlockChain();
        bc.addBlock( new Block( 1, "10/01/2019", { amount: 20 } ) );
        bc.addBlock( new Block( 2, "12/01/2019", { amount: 50 } ) );

        console.log( "is block chain valid?", bc.isChainValid() );

        bc.chain[1].data = { quantity: 31 };
        bc.chain[1].hash = bc.chain[1].calculateHash();

        console.log( "is block chain valid?", bc.isChainValid() );
        ```
        ```
        is block chain valid? true
        is block chain valid? false
        ```
        Also works perfectly because updating the ` hash ` will violate the relationship between **blocks* that are enforced using ` prevHash `.


## Implementing Proof-of-Work in JavaScript
* In the previous implementation of ` SimpleBlockChain `, the process of adding new **blocks** to the **chain** costs nothing. Anyone can add hundreds of thousands of **blocks** per second. Particularly calculting the **hash** of a block is done very quickly. Thus anyone can update a **transaction**, reclculate the **hash**, update the **chain** accordingly, and we will end up with a valid **chain**.

* We need to **enforce** that adding a new **block** costs time to stop spammers. One solution for that is what's called **proof-of-work** or **mining** which is a constraint that makes adding new blocks is a time-consuming process that requires a lot of work. This constraint should be something that takes much time to cheive while it takes less time to evaluate by the network. Usually the **mining** process requires **brute force** where you need to try many many times to fullfil the constraint. As an exmple, which we will use, the **hash** value must start with a sufficient number of zeros. This sufficient number is known as the **difficulty**. For a **block** to be addedd we have to recalculate the **hash** untill we find a **hash** that starts with number of zeros equal to the **difficulty**. However, if we recalculated the **hash** with the same **block**, we get the same **hash** each time. We also can not update something in the **block**. For that we will add a property to the **block** named ` nonce ` which will hold a random number that we can keep invrement till we hit a **hash** that fullfils the constraint. This ` nonce ` also must be passed to ` sha256 ` to affect the **hash** value generated.

* Enough talking let's start:
    1. Add ` nonce ` property to ` Block ` and initialize it with any random number.
    ```js
    constructor( index, timestamp, data, prevHash = "" ) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    ```
    
    2. Pass this ` nonce ` property to ` sha256 `.
    ```js
    calculateHash() {
        return sha256( this.index 
            + this.timestamp 
            + JSON.stringify( this.data ) 
            + this.prevHash 
            + this.nonce ).toString();
    }   
    ```

    3. Define ` mineBlock ` method that keeps updting the ` nonce ` value and recalculating the ` hash ` untill the constraint is fullfiled.
    ```js
    mineBlock( difficulty ) {
        while ( this.hash.substring( 0, difficulty ) !== Array( difficulty + 1 ).join("0") ) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log( this.hash );
    }
    ```

    4. Add ` difficulty ` property to ` SimpleBlockChain `.
    ```js
    constructor() {
        this.chain = [ this.createGenesisBlock() ];
        this.difficulty = 5;
    }
    ```

    5. Use ` mineBlock ` instead of ` calculateHash ` when adding a new **block**.
    ```js
    addBlock( newBlock ) {
        newBlock.prevHash = this.getLastBlock().hash;
        //newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock( this.difficulty );
        this.chain.push( newBlock ); 
    }
    ```

    6. Let's test.
    ```js
    const bc = new SimpleBlockChain();

    console.log( "Adding block 1..." );
    bc.addBlock( new Block( 1, "10/01/2019", { amount: 20 } ) );

    console.log( "Adding block 2..." );
    bc.addBlock( new Block( 2, "12/01/2019", { amount: 50 } ) );
    ```
    Now adding a new **block** takes some time and by increasing the ` difficulty `, it takes much and much.


# Bitcoin Tutorial

## Bitcoin NodeJS Part1 _ Hello World
* The instructor introduced ` NodeJS ` which is nothing new for us.

* Let's start by creating a new project in which we create a simple server.
```js
const http = require( "http" );

http.createServer( ( request, response ) => {
    console.log( "A new user coming in!!" );
    response.end( "Welcome to Bitcoin!!" );
} ).listen( 5000 );
```
If that is new for you, refer to this [NodeJS Crash Course](https://github.com/hossamnasser938/Nodejs-Crash-Course-Documentation/blob/master/course_documentation.md) especially ` Using http ` [section](https://github.com/hossamnasser938/Nodejs-Crash-Course-Documentation/blob/master/course_documentation.md#ussing-http).

* Note: The instructor used port 80 which needs a permission. We can use any port number larger than 1024. I used 5000.

* The new thing is the ` request ` package which is a package we can install by hitting ` npm install request --save `. The ` request ` package is used to make a request to another server from your server. So let's try it.
```js
const http = require( "http" );
const request = require( "request" );

http.createServer( ( req, res ) => {
    console.log( "A new user coming in!!" );

    request( {
        url: "https://blockchain.info/stats?format=json",
        json: false
    }, ( error, response, body ) => {
        console.log( body );
    } );

    res.end( "Welcome to Bitcoin!!" );
} ).listen( 5000 );
```
Note that ` request ` accepts:
  * an object wrapping info about your request like the ` url ` you're targeting.
  * a ` function ` to be executed on getting back from the server and there you expect to get:
    * ` error ` if exists.
    * ` response ` the whole response including the ` body `, ` status code `, and more.
    * ` body ` the body of the ` response `. 


## Bitcoin NodeJS Part 2 _ Express
* Now we know how to use the ` http ` module provided by ` NodeJS ` to create a server. It is very simple. However, working with the popular framework ` express ` is much easier.

* Let's see how to use ` express ` to create a server or a web application whichever you like to name it.
    * To install ` express `, hit ` npm install --save express `.
    
    * To ` import ` ` express `:
    ```js
    const express = require( "express" );
    ```
    
    * To create a web app, just invoke ` express ` to return you an ` app `.
    ```js
    const app = express();
    ```
    
    * Now we can use the ` get ` method on ` app ` to specify what to do when we receive a ` GET ` request from the client with a specific **url** in your application. ` get ` method accepts 2 arguments: the **url** as a string and a callback to be executed. The callback accepts ` request ` and ` response ` exactly like ` http `.
    ```js
    app.get( "/", ( req, res ) => {
        // what to do when the user visits the app home page
    } );
    ```

    ```js
    app.get( "/block", ( req, res ) => {
        // what to do when the user visits the block page of your application
    } );
    ```

    * We can respond to the user by sending data.
        * We can send values using ` send ` method on ` response `.  
        Let's, for example, respond to the user visiting our home page by ` Welcome ` message.
        ```js
        app.get( "/", ( req, res ) => {
            res.send( "Welcome" );
        } );
        ```
        * We can send files like ` html ` files using ` sendfile ` method on ` response `.  Let's respond to the user visiting our block page by an ` html ` file. We create a basic ` html ` file named ` index.html ` in the root directory of the project.
        ```html
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>Block</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                Block page
            </body>
        </html>
        ```
        Then we use ` sendfile ` method to send that file.
        ```js
        app.get( "/block", ( req, res ) => {
            res.sendfile("index.html");
        } );
        ```
        Note that ` sendfile ` accepts the **relative path**. **Relative** means starting from the project root directory. Since ` index.html ` file exists in the project root directory, we specify its path using only its name. If it exist in a subdirectory named files in the root directory, we would specify its path as ` files/index.html `. However, ` sendfile ` is now **deprecated** so we should use the new one ` sendFile ` with ` F ` capitalized `. ` sendFile ` accepts ` the **absolute path** so we should include the global variable ` __dirname `.
        ```js
        res.sendFile( __dirname + "/index.html" ); 
        ```

    * Finally we need to specify the port number to listen on. ` listen ` method accepts 2 arguments: the port number to listen on and an optional callback when a user comee in.
    ```js
    app.listen( 5000, () => console.log( "A new user" ) );
    ```


## Bitcoin NodeJS Part 3 _ Create a Brain Wallet
* For a person that uses **Bitcoin**, he/she needs a way to let people send him/her **Bitcoins**, and another way to restrict access to his/her **Bitcoins**. Exactly like the idea of **email address**. You have a **public email** that lets people send/receive emails to/from you and a **private password** that lets you **only** access all emails sent/received to/from you.

* In **Bitcoin world** you have a **Public Bitcoin Address** that can be used by others to deal with you financially. You also have a **Private Key** that lets you **only** access your **Bitcoins**.

* The **place** you save your **Bitcoin Address** and **Private Key** is called a **Bitcoin Wallet**. Usually you use a peice of **software** for that.

* A **Brain Wallet** is a type of **Bitcoin Wallet**. As the name suggests, a **Brain Wallet** lets you save your combination of **Bitcoin Address** and **Private Key** in your brain. That's a much **secure** way. However, how can you memorize these strange characters? Well, you do not have to memorize such strange characters. You can memorize a meaningful sentence, what they name a **passphrase**, like for example ` My email? hossamnasser938@gmail.com. However, 938 means nothing for me ` and let a peice of **software** generate the combination of **Bitcoin Address** and the **Private key** for you. This **passphrase** must be entirely original. It can not be appeared in a song or a literature. Now let's create a simple **Brain Wallet**.

* We worked with ` Get ` requests. Let's now work with ` POST ` requests. We will dedicate a page in our application where we send an ` html ` ` form ` and let the user fills this ` form ` and send it back in a ` POST ` request. 

* For that we need a package to ` parse ` the incoming ` body ` of the ` form `. This package is ` body-parser ` and can be installed by hitting ` npm install --save body-parser `.

* Let's prepare ` body-parser `.
    1. ` import ` it.
    ```js
    const bodyParser = require( "body-parser" );
    ```

    2. Tell ` express ` that it should use ` body-parser `.
    ```js
    app.use( bodyParser.urlencoded( {
        extended: true
    } ) );

    app.use( bodyParser.json() );
    ```

* We update ` index.html ` file to hold a ` form `.
```js
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Block</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h1>Create a Brain Wallet</h1>
        <form method="post" action="/wallet">
            <input type="text" name="brainsrc">
            <input type="submit">
        </form>
    </body>
</html>
```
Note that we set the ` action ` of the form to ` /wallet ` which means we get a ` POST ` request on ` /wallet `.

* Let's send this ` index.html ` file on home page.
```js
app.get( "/", ( req, res ) => {
    res.sendFile( __dirname + "/index.html" );
} );
```

* Finally let's respond to the ` POST ` request using ` post ` method on ` app `.
```js
app.post( "/wallet", ( req, res ) => {
    const body = req.body; 
} );
```
Now in ` body ` you have the value of the ` input ` we put in the ` form ` under the ` name ` ` brainsrc `.
```js
const brainsrc = body.brainsrc;
    
res.send( brainsrc );
```

* Now we can generate a **Bitcoin Address** and a **Private Key** for the user. For that we use a package named ` bitcore-lib ` which can be installed by hitting ` npm install bitcore-lib --save `. ` bitcore-lib ` contains a lot of useful packages that we can use.
    1. ` import ` it. 
    ```js
    const bitcore = require( "bitcore-lib" );
    ```
    2. Use it.
    ```js
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
    ```


* **References**:
    * [What is a Bitcoin Wallet](https://www.youtube.com/watch?v=oTfOfqmb5tU).
    * [what is a Bitcoin brain wallet](https://www.youtube.com/watch?v=C0dugdUMwY4).


## Bitcoin NodeJS Part4 _ Callback Functions
* Nothing new there. For a refresh we can revise those sections from previous courses:
    1. [Treating functions as first-class citizens](https://github.com/hossamnasser938/Learning_Functional-Programming-with-JavaScript-Course-Documentation/blob/master/1.%20Course%20Introduction/course_introduction.md#treating-functions-as-first-class-citizens).
    2. [First-Class Functions](https://github.com/hossamnasser938/Learning_Functional-Programming-with-JavaScript-Course-Documentation/blob/master/2.%20First-Class%20Functions/first_class_functions.md).
    3. [Callbacks](https://github.com/hossamnasser938/Learning_Functional-Programming-with-JavaScript-Course-Documentation/blob/master/4.%20Callbacks/callbacks.md).
    4. [Why use Node.js](https://github.com/hossamnasser938/Nodejs-Crash-Course-Documentation/blob/master/course_documentation.md#why-use-nodejs).


## Bitcoin NodeJS Part 5 _ Build a Converter App with EJS & Bootstrap
* Now we're going to use ` EJS ` to create a web application that converts from **USD** to **Bitcoin** and viceversa.

* ` EJS `, which is short for ` Embeded JavaScript `, is a **templating language**. A **templating language** is a language that is used to display a content **dynamically**. In contrast with **markup languages** like ` HTML ` which outputes **static** content, ` EJS ` uses **HTML** with the power of **JavaScript**. 

* To install ` EJS `, we hit ` npm install --save ejs `.

* We will stick with ` express ` for simplcity. Now we need to tell ` express ` that we're gonna use ` EJS `. Since ` EJS ` is nothing more than a **view engine**, we do this:
```js
app.set( "view engine", "ejs" );
```

* To display something using ` EJS ` we use ` render ` method and pass it the file name. ` EJS ` expects to find this file in a directory named ` view ` in the project root directory so we're going to create this directory in which we will put all our views. 

* We need an **Api** endpoint to get the value of **Bitcoin** to **USD**. We can google for ` btc-e api last ` and for me I got this [article](https://www.blockchain.com/api/exchange_rates_api) which provided this endpoint ` https://blockchain.info/ticker `. The one the instructor used did not work for me.

* Now everything is setup, we can start developing our **converter**.
    1. We start by defining a ` function ` that gets the value of **Bitcoin** to **USD**. For that we use ` request ` package we used before.
    ```js
    getBTCToUSD = ( callback ) => {
        request({
            url: "https://blockchain.info/ticker",
            json: true
        }, ( error, response, body ) => {
            const btcToUSD = body.USD.last;
            callback( btcToUSD );
        });
    }
    ```
    Note that I defined the ` function ` ` getBTCToUSD ` to accept a callback and invoke it after getting the value we want.

    2. Now let's create a new endpoint in our app in which we respond by ` btcToUsd ` value for testing.
    ```js
    app.get( "/converter", ( req, res ) => {
        getBTCToUSD( ( btcToUSD ) => res.send( btcToUSD.toString() ) );
    } );
    ```
    Note that if you passed a ` numeric ` value to ` res.send `, it won't work. It treats it as a status code.

    3. Now we need to respond to ` /converter ` endpoint with an ` EJS ` file where we ` render ` 2 input fields: one for ` USD ` and the other for ` BTC `. We also want to pass the value we got to be used in converting. Let's create a file in ` views ` directory named ` converter.ejs `.
    ```html
    <html>
        <head>
            <title>Converter</title>
        </head>
        <input type="text" id="btc" value="1">
        BTC to USD
        <input type="text" id="usd" value="<%= btcToUSD %>">
    </html>
    ```
    Note that ` <%= %> ` is the way we access a variable in ` EJS `. In ` index.js ` we can respond to ` converter ` endpoint by ` rendering ` this file and pass an object wrapping ` btcToUSD ` value.
    ```js
    app.get( "/converter", ( req, res ) => {
        getBTCToUSD( ( btcToUSD ) => {
            res.render( "converter", { btcToUSD } );
        } );
    } ); 
    ```

    4. Now we need to add let the user conver values given by him. We will define 2 ` function ` that respond to the user changes to the 2 ` input ` fields. When the user changes ` BTC ` we calculate it equivalent ` USD ` and viceversa. We can add those ` function ` in ` script ` tag in ` converter.ejs `.
    ```html
    <html>
        <head>
            <title>Converter</title>
        </head>
        <input type="text" id="btc" value="1" onkeyup="btcTousd()">
        BTC to USD
        <input type="text" id="usd" value="<%= btcToUSD %>" onkeyup="usdTobtc()">
        <script>
            function btcTousd() {
                const marketPrice = <%= btcToUSD %>;
                const btcVal = document.getElementById( "btc" ).value;

                const usdVal = btcVal * marketPrice;
                document.getElementById( "usd" ).value = usdVal;
            }

            function usdTobtc() {
                const marketPrice = <%= btcToUSD %>;
                const usdVal = document.getElementById( "usd" ).value;

                const btcVal = usdVal / marketPrice;
                document.getElementById( "btc" ).value = btcVal;
            }
        </script>
    </html>
    ```
    Note that we used:
      * ` onkeyup ` ` event ` to respond to user changing the amount of dollars or bitcoins.
      * ` document.getElementById().value ` to access the value in an ` input ` using its ` id `.




const sha256 = require( "crypto-js/sha256" );

class Block {
    constructor( index, timestamp, data, prevHash = "" ) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return sha256( this.index + this.timestamp + JSON.stringify( this.data ) + this.prevHash + this.nonce ).toString();
    }

    mineBlock( difficulty ) {
        while ( this.hash.substring( 0, difficulty ) !== Array( difficulty + 1 ).join("0") ) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log( this.hash );
    }
}

class SimpleBlockChain {
    constructor() {
        this.chain = [ this.createGenesisBlock() ];
        this.difficulty = 5;
    }

    createGenesisBlock() {
        return new Block( 0, "01/01/2019", "Genesis Block", "0" );
    }

    getLastBlock() {
        return this.chain[ this.chain.length - 1 ];
    }

    addBlock( newBlock ) {
        newBlock.prevHash = this.getLastBlock().hash;
        newBlock.mineBlock( this.difficulty );
        this.chain.push( newBlock ); 
    }

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
}

const bc = new SimpleBlockChain();

console.log( "Adding block 1..." );
bc.addBlock( new Block( 1, "10/01/2019", { amount: 20 } ) );

console.log( "Adding block 2..." );
bc.addBlock( new Block( 2, "12/01/2019", { amount: 50 } ) );



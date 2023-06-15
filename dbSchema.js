var mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let dbname = "Gmail";
let dbUrl  = `mongodb+srv://praveen1708:praveen@cluster0.brz2m.mongodb.net/${dbname}`;
module.exports = {dbUrl,mongodb,MongoClient }
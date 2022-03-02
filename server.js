//dependencies
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');
//Mongo Config` 
const MONGO_URI = process.env.MONGO_URI
const Schema = mongoose.Schema
const Model = mongoose.model
//Mongo Url Schema
const urlSchema = new Schema({
  original_url: {type: String, require: true},
  short_url: {type: Number}
},{collection: "shorturls"});
//Mongo Url Model
const Url = Model("Url", urlSchema);
//Mongo Connection
const mongoConnect = () => {
  try { mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true });
  } catch (e){
    console.log(e)
  }
}
//Basic Configuration;
require('dotenv').config();
const app = express();
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
//Root Endpoint
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
})

//Short URL Endpoint
app.post("/api/shorturl", (req,res) => {
  var validUrl = /^(ftp|http|https):\/\/[^ "]+$/.test(req.body.url);
  if (validUrl == true){
    mongoConnect()
    //first find
    Url.findOne({original_url: req.body.url}, (err, url) => {
        if (err) console.log(err);
        if (url != null){
          res.json(url)
        } else {
            var newUrl = new Url({
              original_url: req.body.url
            })
            newUrl.save( (err,data) => {
              if (err) console.log(err)
                //second find
                Url.findOne({original_url: data.original_url},(err, url) => {
                  if (err) return err;
                  res.json(url)
                })
            })
          }
    })
  } else {
    res.send({error: 'invalid url'})
  }
})

app.get("/api/shorturl/:shorturl", (req,res) => {
  console.log(req)
  console.log(parseInt(req.params.shorturl))
  Url.findOne({short_url: parseInt(req.params.shorturl)}, (err, record) => {
        if (err) console.log(err);
        if (record != null){
          console.log(record)
          res.redirect(record.original_url)
        }
  })
})
app.listen(3000, function() {
  console.log(`Listening on port ${3000}`);
});

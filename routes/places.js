import express from "express";
const router = express.Router();
let mongoose = require('mongoose');
mongoose.connect('localhost:3000/spotted');
let Schema = mongoose.Schema;

let userDataSchema = new Schema({
  title: {type: String,required:true},
  content: String,
  author: String,
},{collection:'user-data'})

let UserData = mongoose.model('UserData',userDataSchema);

router.get("/", function (req, res, next) {
  res.send("Got a response from the places route");



  UserData.find().then(function (doc) {
    res.render('index',{index:doc});

  })
});

router.post('/insert',function (req, res, next){
  let item = {
    title:req.body.title,
    content:req.body.content,
    author:req.body.author
  }
  let data = new UserData(item);
  data.save();
  res.redirect('/')
})


router.post('/update',function (req, res, next){
  let item = {
    title:req.body.title,
    content:req.body.content,
    author:req.body.author
  }
  let id = req.body.id;
  UserData.findById(id).then(function (err,doc) {
    if (err){
      console.error('Pas de truc trouvé')
    }
    doc.title= req.body.title;
    doc.content = req.body.content;
    doc.author = req.body.author;
    doc.save();
  })
  res.redirect('/')
})

router.post('/post',function (req, res, next){
let id = req.body.id;
UserData.findByIdAndRemove(id).exec();
res.redirect('/')
})

export default router;

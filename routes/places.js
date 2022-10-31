import express from "express";
import Place from '../models/place.js';

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the Places route");


  Place.find().then(function (doc) {
    res.render('index',{index:doc});
  })
});

router.post('/insert',function (req, res, next){
  let item = {
    name:req.body.name,
    canton:req.body.canton,
    location:req.body.location,
    pictures:req.body.pictures,
    notes:req.body.notes,
    tags:req.body.tags,
  }
  let data = new Place(item);
  data.save();
  res.redirect('/')
})


router.post('/update',function (req, res, next){
  let item = {
    name:req.body.name,
    canton:req.body.canton,
    location:req.body.location,
    pictures:req.body.pictures,
    notes:req.body.notes,
    tags:req.body.tags,
  }
  let id = req.body.id;
  Place.findById(id).then(function (err,doc) {
    if (err){
      console.error('Pas de truc trouvé')
    }
    doc.name= req.body.name;
    doc.canton = req.body.canton;
    doc.location = req.body.location;
    doc.pictures = req.body.pictures;
    doc.notes = req.body.notes;
    doc.tags = req.body.tags;
    doc.save();
  })
  res.redirect('/')
})


router.post('/post',function (req, res, next){
let id = req.body.id;
Place.findByIdAndRemove(id).exec();
res.redirect('/')
})

export default router;

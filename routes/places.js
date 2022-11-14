import express from "express";

import Place from '../models/place.js';
import Note from '../models/note.js';
import Notes from '../routes/notes.js'


const router = express.Router();


router.get("/", async function(req, res, next) {
  let limit = req.query.limit;
  const places = await Place.find({}).limit(limit).exec()
  res.send(places)

  

})

router.get ("/:id/notes", function(req, res, next) {
  
  if (req.place.notes.length == 0) {
    res.send("Aucunes notes");
  }
  req.place.populate(
    {
    path : "Notes",
    populate : {path : "Note"}
  }, function(err){
    let arrayNotes = [];
    req.place.notes.forEach((n)=>{
      arrayPlaces.push(n.place);
    })
    res.send(arrayNotes);
    })

})

router.post('/',function (req, res, next){
let item = {

    name:req.body.name,
    canton:req.body.canton,
    location:req.body.location,
    pictures:req.body.pictures,
    note:req.body.note,
    tags:req.body.tags,
  }
  let data = new Place(item);


  data.save(function(err, savedPlace) {
    if (err) {
      next(err);
    }
    res.send(savedPlace);
  });
 
})


router.post('/update',function (req, res, next){
  let item = {

    name:req.body.name,
    canton:req.body.canton,
    location:req.body.location,
    pictures:req.body.pictures,
    note:req.body.note,
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
    doc.note = req.body.note;
    doc.tags = req.body.tags;

    doc.save();
  })
  res.redirect('/')
})



router.post('/delete',function (req, res, next){
let id = req.body.id;
Place.findByIdAndRemove(id).exec();

res.redirect('/')
})

export default router;



/**
 * @api {get} /places/:id Request a place's information
 *  
 * @apiName GetPlace
 * @apiGroup Place
 *
 * @apiParam {Number} id Place id 
 * @apiParam {String} name Place name 
 *
 * @apiSuccess {String} name Place name
 * @apiSuccess {String} canton  Place canton
 * @apiSuccess {Objects[]} location  Place location
 * @apiSuccess {Strings[]} pictures Place pictures
 * @apiSuccess {Strings[]} notes Place notes
 * @apiSuccess {String[]} tags Place tags
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "name": "chateau de Chillon",
 *       "canton": "Vaud",
 *        "location": "{
 *        1324324234.23,
 *        234234234234.76556
 *        }",
 * "pictures": "{
 *        1,
 *        2,
 *        3
 *          }",
 * "notes": "{
 *        stars : 3,
 *        text: tréjoli,
 *          }",
 * "tags": "{chateau,
 *           Lac}"
 *     }
 */

/**
 * @api {post} /places/:id add Place
 *  
 * @apiName AddPlace
 * @apiGroup Place
 * 
 * @apiParam {String} name Place name, mandatory
 * @apiParam {String} canton place canton, mandatory
 * @apiParam {String} location Place location, mandatory
 * @apiParam {Objects[]} pictures  place pictures, not mandatory
 * @apiParam {Strings[]} notes  place notes, not mandatory
 * @apiParam {Strings[]} tags  place tags, not mandatory
 * 
 * 
 * @apiParamExample Example Body:
 *    {
 *     "name": "Chateau de Chillon",
 *    "canton": "Vaud",
 *   "location": "{
 *        1324324234.23,
 *        234234234234.76556
 *        }",
 * "pictures": "{
 *       1,
 *      2,
 *    3
 *   } ,
 * "notes": "{
 *       stars : 3,
 *      text: tréjoli
 *  }",
 * "tags": "{chateau,
 *         Lac}"
 * }
 * 
 * 
 * 
 * @apiSuccess {String} firstName place name
 * @apiSuccess {String} surname  place surname
 * @apiSuccess {String} password  place password
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre place à été créé !"
 *       
 *     }
 */

/**
 * @api {post} /places/:id add Place
 *  
 * @apiName AddPlace
 * @apiGroup Place
 * 
 * @apiParam {String} name Place name, mandatory
 * @apiParam {String} canton place canton, mandatory
 * @apiParam {String} location Place location, mandatory
 * @apiParam {Objects[]} pictures  place pictures, not mandatory
 * @apiParam {Strings[]} notes  place notes, not mandatory
 * @apiParam {Strings[]} tags  place tags, not mandatory
 * 
 * 
 * @apiParamExample Example Body:
 *    {
 *     "name": "Chateau de Chillon",
 *    "canton": "Vaud",
 *   "location": "{
 *        1324324234.23,
 *        234234234234.76556
 *        }",
 * "pictures": "{
 *       1,
 *      2,
 *    3
 *   } ,
 * "notes": "{
 *       1,
 * 2,
 * 3
 *  }",
 * "tags": "{chateau,
 *         Lac}"
 * }
 * 
 * 
 * 
 * @apiSuccess {String} firstName place name
 * @apiSuccess {String} surname  place surname
 * @apiSuccess {String} password  place password
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre place à été créé !"
 *       
 *     }
 */

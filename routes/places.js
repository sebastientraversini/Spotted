import express from "express";

import Place from '../models/place.js';
import Note from '../models/note.js';

const router = express.Router();


import { authenticate } from "./auth.js";


let offset = 0;
let limit = 20;



// router.get("/:nom-:prenom")
// req.params.nom // nom
// router.get("/pictures?_start={}&limit={}".format(offset,limit), function (req, res, next) {
//   /* res.send("Got a response from the Places route"); */
  
//    Place.find().then(function (doc) {
//     res.render('index',{index:doc});

//   })
 

// });


router.get("/", async function(req, res, next) {
  let limit = req.query.limit;
  const places = await Place.find({}).limit(limit).exec()
  res.send(places)
})

//chercher by id
router.get("/:id", getPlaceId, function (req, res, next) {
  res.send(req.place);
});

function getPlaceId(req, res, next) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    Place.findById(req.params.id).exec(function (err, place) {
      if (err) {
        return next(err);
      } else if (!place) {
        return res.status(404).send("Il n'existe pas de place avec cet id")
      }
      req.place = place;
      next();
    });
  } else {
    return res.status(404).send("Il n'existe pas de place avec cet id")
  }
}

//poster une nouvelle note pour une place existante
router.post("/:id/notes", getPlaceId, authenticate, function (req, res, next) {

  let item = {
    author: req.userId,
    stars:req.body.stars,
    text:req.body.text,
    place: req.place._id
  }

  let data = new Note(item);

  data.save(function(err, savedNote) {
    if (err) {
      next(err);
    }
    else {
      res.send(savedNote);
    }
});
});

//chercher toutes les notes liées à une place
router.get("/:id/notes", getPlaceId, function (req, res, next) {

  Note.find().where('place').equals(req.place._id).exec(function (err, result) {
    if (result.length == 0 || err) {
      // console.log(req.user)
      res.send("pas de notes crées pour cette place");
      return;
    }

    res.send(result);

  });

});


router.post('/',authenticate, function (req, res, next){
let item = {

    name:req.body.name,
    canton:req.body.canton,
    location:req.body.location,
    pictures:req.body.pictures,
    notes:req.body.note,
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
 * @api {post} /users/:id add Place
 *  
 * @apiName AddPlace
 * @apiGroup Place
 * 
 * @apiParam {String} name Place name, mandatory
 * @apiParam {String} canton User canton, mandatory
 * @apiParam {String} location Place location, mandatory
 * @apiParam {Objects[]} pictures  User pictures, not mandatory
 * @apiParam {Strings[]} notes  User notes, not mandatory
 * @apiParam {Strings[]} tags  User tags, not mandatory
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
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} surname  User surname
 * @apiSuccess {String} password  User password
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre user à été créé !"
 *       
 *     }
 */

/**
 * @api {post} /users/:id add Place
 *  
 * @apiName AddPlace
 * @apiGroup Place
 * 
 * @apiParam {String} name Place name, mandatory
 * @apiParam {String} canton User canton, mandatory
 * @apiParam {String} location Place location, mandatory
 * @apiParam {Objects[]} pictures  User pictures, not mandatory
 * @apiParam {Strings[]} notes  User notes, not mandatory
 * @apiParam {Strings[]} tags  User tags, not mandatory
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
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} surname  User surname
 * @apiSuccess {String} password  User password
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre user à été créé !"
 *       
 *     }
 */

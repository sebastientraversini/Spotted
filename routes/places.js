import express from "express";
import Picture from '../models/picture.js';
import Place from '../models/place.js';
import Note from '../models/note.js';

const router = express.Router();
import multer from "multer";
const upload = multer();


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

//obtenir les places avec une limite
router.get("/", async function (req, res, next) {
  let limit = req.query.limit;
  const places = await Place.find({}).limit(limit).exec()
  res.send(places)
})

//chercher by id
router.get("/:id", getPlaceId, function (req, res, next) {
  res.send(req.place);
});

//middleware id
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

//créer une place
router.post('/', authenticate, function (req, res, next) {
  let item = {
    creator: req.userId,
    name: req.body.name,
    canton: req.body.canton,
    location: req.body.location,
    pictures: req.body.pictures,
    notes: req.body.note,
    tags: req.body.tags,
  }
  let data = new Place(item);

  data.save(function (err, savedPlace) {
    if (err) {
      next(err);
    }
    res.send(savedPlace);
  });

})

//update une place

router.patch('/:id', getPlaceId, authenticate, function (req, res, next) {

  //checker si créateur place = l'user qui cherche à la modifier
  Place.findById(req.place._id, function (err, docs) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(docs.creator, req.userId)

      if (!docs.creator.equals(req.userId)) {
        return res.status('403').send("You can only delete places you created")
      }

      //update la place
      Place.findOneAndUpdate(
        { _id: req.place._id },
        { name: req.body.name, canton: req.body.canton },
        function (err, user) {
          if (err) {
            next(err);
            return;
          }
          console.log(user)
          res.send("tu as modifié la place, bravo !")
        })
    }
  });

})

//supprimer une place
router.delete('/:id', getPlaceId, authenticate, function (req, res, next) {

  Place.findById(req.place._id, function (err, docs) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(docs.creator, req.userId)

      if (!docs.creator.equals(req.userId)) {
        return res.status('403').send("You can only delete places you created")
      }

      Place.findOneAndDelete({ _id: req.place._id }, function (err, user) {
        if (err) {
          next(err);
          return;
        }
        res.send("tu as supprimé la place, bravo !")
      })
    }
  });

})

//poster une nouvelle note pour une place existante
router.post("/:id/notes", getPlaceId, authenticate, function (req, res, next) {

  let item = {
    author: req.userId,
    stars: req.body.stars,
    text: req.body.text,
    place: req.place._id
  }

  let data = new Note(item);

  data.save(function (err, savedNote) {
    if (err) {
      next(err);
    }
    else {
      res.send(savedNote);
    }
  });
});


//chercher toutes les notes détaillées liées à une place
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

//chercher la note globale (1-5) d'une place
router.get("/:id/score", getPlaceId, function (req, res, next) {

  Note.find().where('place').equals(req.place._id).exec(function (err, result) {
    if (result.length == 0 || err) {
      // console.log(req.user)
      res.send("nobody scored this place");
      return;
    }

    let sum = 0;
    let count = 0;
    result.forEach((el) => {
      sum += el.stars;
      count++;
    })
    let globaleScore = {
      "score":
        sum / count,
      "number review": count
    }
    console.log(globaleScore)

    res.send(globaleScore);

  });

});

//chercher les tags liés à une place
router.get("/:id/tags", authenticate, getPlaceId, function (req, res, next){
res.send(req.place.tags)
})

//ajouter un tag à une place s'il n'existe pas déjà

router.post("/:id/tags", authenticate, getPlaceId, function (req, res, next) {

  let newTag = req.body.tag;
  console.log(newTag)


  let alreadyInArray = false;
  let arrayExistingTags = req.place.tags
  let newArrayTags = [];
  arrayExistingTags.forEach((el) => {
    newArrayTags.push(el);
    if (el === req.body.tag) {
      alreadyInArray = true;
    }
  })

  if (!alreadyInArray) {
    //push le tag dans le nouveau tableau de tags
    newArrayTags.push(req.body.tag)
/*     res.send(newArrayTags) */
    //patch le tableau de tags 

    Place.findById(req.place._id, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        Place.findOneAndUpdate(
          { _id: req.place._id },
          { tags : newArrayTags },
          function (err, user) {
            if (err) {
              next(err);
              return;
            }
            console.log(user)
            res.send("Congrats, your tag has been added to this place !")
          })
      }
    });


  } else res.send("This tag exists already for this place. Please enter a new one !");
});



//poster une nouvelle photo pour une place existante
router.post('/:id/pictures', getPlaceId, authenticate, upload.single('picture'), function (req, res, next) {
  /*     const bufferImage = Buffer.from(req.file); */
  let item = {
    author: req.userId,
    place: req.place._id,  // Une place existe avant la photo, l'user choisit dans l'app la place et nous on envoie son id en body
    picture: req.file.buffer  /* bufferImage */
  }

  let data = new Picture(item);


  data.save(function (err, data) {
    if (err) {
      next(err)
      return;
    };

    res.send(data)
  });

})


//chercher toutes les photos liées à une place
router.get("/:id/pictures", getPlaceId, function (req, res, next) {

  Picture.find().where('place').equals(req.place._id).exec(function (err, result) {
    if (result.length == 0 || err) {
      // console.log(req.user)
      res.send("no pictures posted for this place");
      return;
    }

    res.send(result);

  });

});

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
 * @api {post} /places/ add Place
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

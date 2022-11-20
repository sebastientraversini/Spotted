import express from "express";
import Picture from '../models/picture.js';
import Place from '../models/place.js';
import Note from '../models/note.js';

const router = express.Router();
import multer from "multer";
const upload = multer();

import { textFormat } from "../spec/utils.js";
import { textFormatToCompare } from "../spec/utils.js";


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



//get places filtered by cantons
router.get("/filter", async function (req, res, next) {
  console.log("ca marche");
  let canton = req.query.canton;
  console.log(canton);
  const places = await Place.find({ canton: canton }).exec();
  res.send(places)

})


//obtenir les places qui contiennent ce tag
router.get("/tag", async function (req, res, next) {

  let arrayPlacesWithThisTag = [];
  console.log(req.body.tag)
  let tagSearched = textFormatToCompare(req.body.tag);

  let allPlaces = await Place.find({}).limit(limit).exec()
  allPlaces.forEach((el) => {
    //je suis dans chaque place
    let tagInThisPlace = false;
    el.tags.forEach((t) => {
      //je suis dans chaque tag
      if (textFormatToCompare(t) === tagSearched) {
        tagInThisPlace = true;
      }
      console.log(t)
    })
    //si tag est présent dans cette place, on ajoute la place dans tableau des places contenant ce tag
    if (tagInThisPlace) {
      arrayPlacesWithThisTag.push(el);
    }
    /*     console.log(el.tags) */
  })


  /*   let [tags] = req.query.tags;
    
    const places = await Place.find({ tags: [tags]}).exec() */
    if(arrayPlacesWithThisTag.length == 0) {
      return res.send("no place contains this tag")
    }
  res.send(arrayPlacesWithThisTag)

})

router.get("/:id/notes", function (req, res, next) {

  console.log("on est arrivés dans la route");

  /* if (req.place.notes.length == 0) {
    res.send("Aucunes notes");
  } */
  test();

  async function test() {
    req.place.populate(
      {
        path: "Notes",
        populate: { path: "Note" }
      },

      await function (err) {
        let arrayNotes = [];
        req.place.notes.forEach((n) => {
          arrayPlaces.push(n.place);
        })
        res.send(arrayNotes);
      })

  }


})

router.get("/:id", function (req, res, next) {
  res.send(req.place);

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

//créer une place --> check if this place already exists in this canton
router.post('/', authenticate, async function (req, res, next) {

  let newPlaceWished = textFormatToCompare(req.body.name);
  let cantonOfNewPlaceWished = textFormatToCompare(req.body.canton);

  let alreadyCreated = false;
  const places = await Place.find({}).limit(limit).exec()
  places.forEach((el) => {
    let existingPlace = textFormatToCompare(el.name);
    let cantonOfExistingPlace = textFormatToCompare(el.canton);
    if (newPlaceWished === existingPlace && cantonOfExistingPlace === cantonOfNewPlaceWished) {
      alreadyCreated = true;
    };
  })

  if (alreadyCreated) {
    return res.status(400).send("This place already exists")
  }

  let item = {
    creator: req.userId,
    name: textFormat(req.body.name),
    canton: textFormat(req.body.canton),
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
        { name: textFormat(req.body.name), canton: textFormat(req.body.canton) },
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
router.get("/:id/tags", authenticate, getPlaceId, function (req, res, next) {
  res.send(req.place.tags)
})

//ajouter un tag à une place s'il n'existe pas déjà

router.post("/:id/tags", authenticate, getPlaceId, function (req, res, next) {

  let newTag = textFormatToCompare(req.body.tag);
  console.log(newTag)


  let alreadyInArray = false;
  let arrayExistingTags = req.place.tags
  let newArrayTags = [];
  arrayExistingTags.forEach((el) => {
    newArrayTags.push(el);

    if (el.trim().toUpperCase() === newTag) {
      alreadyInArray = true;
    }
  })

  if (!alreadyInArray) {
    //push le tag dans le nouveau tableau de tags
    let myNewTag = textFormat(req.body.tag);
    newArrayTags.push(myNewTag)
    /*     res.send(newArrayTags) */
    //patch le tableau de tags 

    Place.findById(req.place._id, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        Place.findOneAndUpdate(
          { _id: req.place._id },
          { tags: newArrayTags },
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






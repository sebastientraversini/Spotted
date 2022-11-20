import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as config from "../config.js";
import { authenticate } from "./auth.js";
import Picture from "../models/picture.js";
import Note from "../models/note.js";
import Place from "../models/place.js";
import { textFormat } from "../spec/utils.js";
import { textFormatToCompare } from "../spec/utils.js";

const router = express.Router();

router.get("/", authenticate, function (req, res, next) {
  User.find().sort('name').exec(function (err, users) {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
});

router.post("/", function (req, res, next) {
  //on récupère le password envoyé dans la requête
  const plainPassword = req.body.password;
  const costFactor = 10;
  //on hash le password + le sable
  bcrypt.hash(plainPassword, costFactor, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }
    // Create a new document from the JSON in the request body
    const newUser = new User({
      name: textFormat(req.body.name),
      surname: textFormat(req.body.surname)
    });
    //on rentre le password hashé comme nouveau mdp de l'user
    newUser.passwordHash = hashedPassword;
    // Save that document
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }
      res.send(savedUser);
    });
  });
});

function getUserId(req, res, next) {
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    User.findById(req.params.id).exec(function (err, user) {
      if (err) {
        return next(err);
      } else if (!user) {
        return res.status(404).send("No user exists with this id")
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(404).send("No user exists with this id")
  }
}

//chercher by id
router.get("/:id", getUserId, function (req, res, next) {
  res.send(req.user);
});

router.patch("/:id", getUserId, async function (req, res, next) {

  const updated = await User.update(
    {
      _id: req.user.id,
    },
    {
      name: req.body.name,
      surname: req.body.surname
    }
  );

  res.send("user modifié");
});



//chercher photos d'un user
router.get("/:id/pictures", getUserId, function (req, res, next) {

  Picture.find().where('author').equals(req.user._id).exec(function (err, result) {
    if (result.length == 0 || err) {
      // console.log(req.user)
      res.send("no picture for this user");
      return;
    }

    res.send(result);

  });

  /* avec aggregate 
   Picture.aggregate([{
      $match: { author: req.user._id }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'licorne'
      }
    },
    { $unwind: '$licorne' }], (err, results) => {
      if (err) console.log(err)
      console.log(results)
      res.send(results)
    })
   */

});

//chercher notes d'un user
router.get("/:id/notes", getUserId, function (req, res, next) {

  Note.find().where('author').equals(req.user._id).populate("place").exec(function (err, result) {
    if (result.length == 0 || err) {
      // console.log(req.user)
      res.send("this user hasn't created any notes");
      return;
    }

    res.send(result);

  });

});



//chercher places visitées d'un user (en passant par Notes)
router.get("/:id/visitedPlaces", getUserId, function (req, res, next) {

  Note.find().where('author').equals(req.user._id).populate("place").exec(function (err, result) {
    if (result.length == 0 || err) {
      // console.log(req.user)
      res.send("this user hasn't visited any places");
      return;
    }
    let visitedPlaces = [];
    result.forEach((n) => {
      visitedPlaces.push(n.place)
    })

    const simplifiedVisitedPlaces = visitedPlaces.map(place => {
      return {
        _id: place._id,
        location: place.location.coordinates,
        name: place.name,
        canton: place.canton
      }
    })

    let monArrayFinal = [];

    simplifiedVisitedPlaces.forEach((el) => {
      let oneVisitedPlace = el._id
      let alreadyInArray = false;
      monArrayFinal.forEach((el2) => {
        if (el2._id && el2._id == el._id) {
          alreadyInArray = true;
          console.log("estLa")
        }
      })

      if (!alreadyInArray) {
        monArrayFinal.push({
          _id: el._id,
          location: el.location,
          name: el.name,
          canton: el.canton
        })
      }
    })
    res.send(monArrayFinal)

    //map de l'array pour transformer l'objectId en String pour pouvoir le filtrer
    /*     const mappedFilterArray = visitedPlaces.map(place => place.toString());
    
        let uniqueVisitedPlaces = Array.from(new Set(mappedFilterArray));
    
        console.log(uniqueVisitedPlaces)
    
        res.send(uniqueVisitedPlaces); */

  });

});


//supprimer un user --> uniquement si c'est soi
router.delete("/:id", getUserId, authenticate, function (req, res, next) {
  //vérifier si user valide
  //vérifier si user à supprimer est = à l'utilisateur authentifié
  /*   res.send([req.user._id,req.userId]) */
  //req.user._id vient de getUserId et req.userId est l'id du user authentifié
  if (!req.user._id.equals(req.userId)) {
    return res.status('403').send("You can't delete another user")
  }
  /*   res.send(req.user._id) */
  User.findOneAndDelete({ _id: req.user._id }, function (err, user) {
    if (err) {
      next(err);
      return;
    }
    res.send("You deleted yourself, congrats")
  })

});

//modifier user
router.patch("/:id", getUserId, authenticate, async function (req, res, next) {

  const filter = { _id: req.user._id };
  const update = {
    name: textFormat(req.body.name),
    surname: textFormat(req.body.surname)
  }

  if (!req.user._id.equals(req.userId)) {
    return res.status('403').send("You can't update another user")
  }

  const userUpdated = await User.findOneAndUpdate(filter, update);
  res.send("Congrats, update has been made");

});



//modifier password user --> seulement le nôtre + si on se souvient du last mot de passe
router.patch("/:id/password", getUserId, authenticate, async function (req, res, next) {

  if (!req.user._id.equals(req.userId)) {
    return res.status('403').send("You can't update password from others users")
  }

  //on prend le password envoyé dans le body (tentative de connexion)
  const lastPassword = req.body.lastPassword;
  let newPassword = req.body.newPassword;
  //on prend le password Hashé de la database de cet user
  const passwordHash = req.user.passwordHash;
  //on les compare
  const valid = await bcrypt.compare(lastPassword, passwordHash);
  if (valid) {
    const costFactor = 10;
    //on hash le nouveau password + le sable
    bcrypt.hash(newPassword, costFactor, async function (err, hashedPassword) {
      if (err) {
        return next(err);
      }
      //on rentre le password hashé comme nouveau mdp de l'user
      const passwordUpdated = await User.findOneAndUpdate({ _id: req.user._id }, { passwordHash: hashedPassword });
      res.send("Congrats, update has been made");
    });

  }
  else { res.status(401).send("Last password is wrong. Please enter your true password") }

});


export default router;


/**
 * @api {get} /users/:id Request a user's information
 *  @apiPermission seulement un user peut voir ses propres données
 * 
 * @apiName Get a User
 * @apiGroup User
 *
 * @apiParam {Number} id User id
 *
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} lastName  User surname
 * @apiSuccess {Objects[]} pictures  User pictures
 * @apiSuccess {Strings[]} notes  User notes
 * @apiSuccess {String} passwordHash  User passwordHash
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "firstname": "Florian",
 *       "lastname": "Quadri",
 *        "pictures": "{
 *        1,
 *        2,
 *        3
 *        }",
 * "notes": "{
 *        1,
 *        2,
 *        3
 *          }",
 * "passwordHash": "s234jdsl31osaweak23o",
 *     }
 * 
 * @apiError {String} id Pas d'utilisateur avec cet id, cherche mieux
 * @apiError {String} id2 unauthorized
 * @apiErrorExample {json} Error-Response:      
 * HTTP/1.1 404 Not Found 
 *     { 
 *      "error": "Pas d'utilisateur avec cet id, cherche mieux" 
 *     }
 */





/**
 * @api {post} /users/ add a User
 *  
 * @apiName Add a User
 * @apiGroup User
 * 
 * @apiParam {String} firstname User firstname
 * @apiParam {String} surname User surname
 * @apiParam {String} password User password
 * 
 * @apiParamExample Example Body:
 *    {
 *     "firstname": "Florian",
 *    "surname": "Quadri",
 *   "password": "123456"
 *   } 
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre user à été créé !"
 *       
 *     }
 */





/**
 * @api {patch} /users/:id change a User
 * @apiPermission seulement un user peut modifier ses propres données
 *  
 * @apiName change a User
 * @apiGroup User
 * 
 * @apiParam {String} firstname User firstname
 * @apiParam {String} surname User surname
 * 
 * 
 * @apiParamExample Example Body:
 *    {
 *     "firstname": "Florian",
 *    "surname": "Ouakel",
 *   } 
 * 
 * @apiSuccess {String} firstName User name
 * @apiSuccess {String} surname  User surname
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre user à été modifié !"
 *       
 *     }
 */




/**
 * @api {delete} /users/:id delete a User
 *  
 * @apiName delete a User
 * @apiGroup User
 * 
 * @apiParam {String} id User id
 * 
 * 
 * @apiParamExample Example Body:
 *    {
 *     "id": "aed74a9c0fk3lofkvu4"
 *   } 
 * 
 * 
 * @apiSuccess {String} id User id
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre user à été delete !"
 *       
 *     }
 */





/**
 * @api {post} /places/:id/pictures add a Picture
 *  @apiPermission seulement les users connectés
 * @apiName Add a Picture
 * @apiGroup Picture
 * 
 * @apiParam {String} picture picture picture
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "votre picture à été ajoutée !"
 *       
 *     }
 */




/**
 * @api {get} places/:id/pictures/:id Request a picture's information
 *  
 * @apiName GetPicture
 * @apiGroup Picture
 *
 * @apiParam {Number} id Picture id 
 *
 * @apiSuccess {String} author picture's author
 * @apiSuccess {String} place  picture's place
 * @apiSuccess {String} picture[] picture's picture
 * 
 * 
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "auhor": "aefj4clcro5jd3",
 *       "place": "Chateau de Chillon",
 *       "picture": "[1,2,3]"
 * }
 */



/**
 * @api {get} users/:id/notes/:id Request a note's information
 *  
 * @apiName GetNotes
 * @apiGroup Note
 *
 * @apiParam {Number} id User id 
 *
 * @apiSuccess {String} author Note author
 * @apiSuccess {String} place  Note place
 * @apiSuccess {String} stars Note stars
 * @apiSuccess {String} text  Note text
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "author": "aeff3f45sdfv4323",
 *       "place": "ascc43233d3dre",
 *      "stars": "2",
 *     "text": "trébo"
 *    }
 * 
 */




/**
* @api {post} places/:id/notes/ add a Note
*  @apiPermission seulement un user connecté
* @apiName Add a Note
* @apiGroup Note
* 
* @apiParam {Objects[]} stars Note stars
* @apiParam {Strings[]} text Note text
* 
* @apiParamExample Example Body:
*    {
*       "stars" : "3",
*      "text": "tréjoli"
*  }
* 
* @apiSuccessExample Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "votre note à été créé !"
*     }
*/





/**
* @api {post} /places/ add a Place
*   @apiPermission seulement les users connectés
* @apiName Add a Place
* @apiGroup Place
* 
* @apiParam {String} name Place name
* @apiParam {String} canton User canton
* @apiParam {String} location Place location
* 
* @apiParamExample Example Body:
*    {
*     "name": "Chateau de Chillon",
*    "canton": "Vaud",
*   "location": "{
*        1324324234.23,
*        234234234234.76556
*        }"
* }
* 
* @apiSuccessExample Success-Response:
*     HTTP/1.1 200 OK
*     {
*       "votre place à été créé !"
*       
*     }
*/




/**
* @api {get} /places/:id Request a place's information
*  
* @apiName Get a Place
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
*        [stars : 3,text: tréjoli],
* [stars : 2, text: trébo]
*          }",
* "tags": "{chateau,
*           Lac}"
*     }
*/
import express from "express";
import User from '../models/user.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as config from "../config.js"

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const user = await User.findOne({ name: req.body.name });
        if (!user) {
            res.status(401).send("Bad login : t'es pas dans la database askip");
        }
        //on prend le password envoyé dans le body (tentative de connexion)
        const password = req.body.password;
        //on prend le password Hashé de la database de cet user
        const passwordHash = user.passwordHash;
        //on les compare
        const valid = await bcrypt.compare(password, passwordHash);
        if (valid) {
            const subject = user._id;
            const expiresIn = Math.floor(Date.now() / 1000) + 7 * 24 * 3600; //= 7 days
            const secretKey = process.env.SECRET_KEY || "trouvemoisitarrive";
            // Create and sign a token.
            jwt.sign({ sub: subject, exp: expiresIn }, config.jwtSecret, function (err, token) {
                if (err) {
                    next(err)
                } else {
                    res.send({ "token" : token,
                    "message" : `Bien joué t'es online, ${user.name}!` 
                 })
                }
                // Use the signed token...
            });

        }
        else { res.status(401).send("Bad Login : mauvais mot de passe boloss") }
    } catch (err) {
        next(err)
    }
})

export default router;

export function authenticate(req, res, next) {
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader) {
      return res.sendStatus(401);
    }
  
    const match = authorizationHeader.match(/^Bearer (.+)/);
    if (!match) {
      return res.sendStatus(401);
    }
  
    const bearerToken = match[1];
    jwt.verify(bearerToken, config.jwtSecret, (err, payload) => {
      if (err) {
        return res.sendStatus(401);
      }
  
      req.userId = payload.sub;
      next();
    });
  }
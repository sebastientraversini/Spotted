import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Got a response from the notes route");
});
router.get("/hello", function (req, res, next) {
    res.send("hello");
  });

export default router;

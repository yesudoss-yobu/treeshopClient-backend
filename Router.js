const express = require("express");
const router = express.Router();
const InfoRouter = require("./Schema");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

//getall
router.get("/", async (req, res) => {
  console.log("all data got");
  var findData = await InfoRouter.find();

  res.json(findData);
});

//getall acending
//if you want decending change -1
router.get("/acend", async (req, res) => {
  var findData = await InfoRouter.find().sort({ name: 1 });
  console.log(findData.length);
  res.json(findData);
});

//getById

// router.get("/:id", async (req, res) => {
//   var findData = await InfoRouter.findById(req.params.id);
//   if (!findData) {
//     res.status(404).send("Given id is not found");
//   } else {
//     res.json(findData);
//   }
// });

//get byname
router.get("/findbyname/:name", async (req, res) => {
  var findData = await InfoRouter.find({ name: req.params.name });
  res.json(findData);
});

//get by catagory
router.get("/posts", async (req, res) => {
  const { sellerName } = req.query;
  console.log(sellerName);
  let findData = await InfoRouter.find({ sellerName: sellerName });
  console.log(findData.length);
  res.json(findData);
});

//create
router.post("/", async (req, res) => {
  var data = new InfoRouter(req.body);
  await data.save();
  res.json(data);
});

//insertMany

router.post("/posts", async (req, res) => {
  try {
    const postMany = await InfoRouter.insertMany(req.body);
    res.json(postMany);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//update
router.put("/update/:id", async (req, res) => {
  var update = await InfoRouter.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: {
        _id: req.params.id,
        name: req.body.name,
        profile: req.body.profile,
        price: req.body.price,
        sellerName: req.body.sellerName,
        rating: req.body.rating,
        reviews: req.body.reviews,
        details: req.body.details,
      },
    }
  );
  res.json(update);
});

//delete

router.delete("/del/:id", async (req, res) => {
  var deldata = await InfoRouter.findByIdAndRemove(req.params.id).then((e) => {
    res.json({ message: "deleted successfuly" });
  });
});

//for testing jwt authentication

router.post("/login", (req, res) => {
  //authenticated user
  const username = req.body.name;
  // Set the expiration time to 1 hour from now
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60;

  // const user = { name: username, exp: expiry };
  const user = { name: username };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: "100s",
  });
  res.json({ accessToken: accessToken });
});

//authentication
const authenticateToken = (req, res, next) => {
  const authheader = req.headers["authorization"];
  // console.log(authheader);
  // const token = authheader && authheader.split(" ")[1];
  const token = authheader && authheader;
  if (!token) return res.status(401).send("unauthorised");
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      // return res.sendStatus(403);
      console.log(err.name);
      if (err.name === "TokenExpiredError") {
        return res.status(403).send("token expired!");
      } else {
        return res
          .status(403)
          .send("you have't permission to accces this site");
      }
    }
    req.user = user;
    next();
  });
};

//get with authentication

router.get("/secure", authenticateToken, async (req, res) => {
  const user = req.user.name;
  const data = await InfoRouter.find();
  const secureData = data.filter(({ name }) => name === user);
  res.json(secureData);
});

module.exports = router;

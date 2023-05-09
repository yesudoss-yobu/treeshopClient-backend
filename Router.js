const express = require("express");
const router = express.Router();
const InfoRouter = require("./Schema");

//getall
router.get("/", async (req, res) => {
  console.log("all data getted");
  var findData = await InfoRouter.find();
  res.json(findData);

  // res.status(200).send({
  //   message: "data arrived from mongodb",
  //   data: findData,
  //   status: "success",
  // });

  // res.json({ data: findData, message: "data arrived", status: "success" });
});

//getall acending
//if you want decending change -1
router.get("/acend", async (req, res) => {
  var findData = await InfoRouter.find().sort({ name: 1 }).exec();
  res.json(findData);
});

//getById

router.get("/:id", async (req, res) => {
  var findData = await InfoRouter.findById(req.params.id);
  if (!findData) {
    res.status(404).send("Given id is not found");
  } else {
    res.json(findData);
  }
});

//get byname
router.get("/findbyname/:name", async (req, res) => {
  var findData = await InfoRouter.find({ name: req.params.name });
  res.json(findData);
});

//create
router.post("/", async (req, res) => {
  console.log(req.body);
  var data = new InfoRouter(
    req.body
    //   {
    //   _id: req.body._id,
    //   name: req.body.name,
    //   profile: req.body.profile,
    //   price: req.body.price,
    //   sellerName: req.body.sellerName,
    //   rating: req.body.rating,
    //   reviews: req.body.reviews,
    //   details: req.body.details,
    // }
  );
  await data.save();
  res.json(data);
});

//insertMany

router.post("/posts", async (req, res) => {
  try {
    console.log(req.body);
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

module.exports = router;

// router.get("/", authenticate, async (req, res) => {
//   console.log("all data getted");
//   var findData = await InfoRouter.find();
//   res.json(findData);
// });

// function authenticate(req, res, next) {
//   // Check if user is authenticated
//   if (req.isAuthenticated()) {
//     // User is authenticated, call next middleware
//     return next();
//   } else {
//     // User is not authenticated, send unauthorized status
//     return res.status(401).send("Unauthorized");
//   }
// }

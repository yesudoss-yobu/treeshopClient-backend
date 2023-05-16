const express = require("express");
const router = express.Router();
const InfoRouter = require("./Schema");
const jwt = require("jsonwebtoken");

//getall
router.get("/", async (req, res) => {
  console.log("all data got");
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
  // var findData = await InfoRouter.find().sort({ name: 1 }).skip(5).exec();
  // var findData = await InfoRouter.find().where({ sellerName: "amazon" });
  var findData = await InfoRouter.find().sort({ name: 1 });
  // we can use skip, limit,sort queries
  // if use where to get perticular category where({ category: 'technology' })
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

//for testing jwt authentication

router.post("/login", (req, res) => {
  //authenticated user
  const username = req.body.name;
  // Set the expiration time to 1 hour from now
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60;

  // const user = { name: username, exp: expiry };
  const user = { name: username };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
    expiresIn: "30s",
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

// redirect path

router.get("/redirect", async (req, res) => {
  // console.log(req.headers["referer"]);
  // res.redirect("http://localhost:5000/info");
  res.redirect("http://localhost:3001/dashboard");
  // res.json(true);
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

//notes

// req.params: An object containing properties mapped to the named route "parameters". For example, if you have a route that looks like /users/:userId, and a request is made to /users/123, then req.params will be { userId: '123' }.

// req.query: An object containing a property for each query string parameter in the route. For example, if you have a route that looks like /search?q=term, then req.query will be { q: 'term' }.

// req.body: An object containing the parsed request body, typically populated by middleware like body-parser.

// req.headers: An object containing the HTTP headers sent with the request.

// req.cookies: An object containing cookies sent by the user-agent.

// req.ip: The IP address of the client that made the request.

// req.protocol: The protocol used by the request (e.g. 'http' or 'https').

// req.method: The HTTP method used by the request (e.g. 'GET', 'POST', etc.).

// Request Headers:
// Accept: Indicates the media types that the client is willing to accept in the response.
// Authorization: Contains authentication credentials for accessing a protected resource.
// Cache-Control: Specifies caching behavior of both client and server.
// Content-Type: Indicates the MIME type of the content sent in the request.
// User-Agent: Contains information about the user agent (e.g., browser) that made the request.
// Referer: Specifies the URL of the page that linked to the current page.

// Response Headers:
// Access-Control-Allow-Origin: Specifies which origins are allowed to access a resource.
// Cache-Control: Specifies caching behavior of both client and server.
// Content-Encoding: Indicates the encoding of the content.
// Content-Type: Indicates the MIME type of the content sent in the response.
// ETag: Provides a unique identifier for the version of the resource returned.
// Location: Provides the URL of a newly created resource.
// Server: Provides information about the server software used to generate the response.

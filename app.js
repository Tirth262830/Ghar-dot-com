const express = require("express");
const mongoose = require("mongoose");

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
//const session = require('express-session');
const MongoStore = require('connect-mongo');
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require('./schema.js');
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const app = express();
const stripe = require('stripe')('your-stripe-secret-key');
require('dotenv').config();


// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' });
// const model = require('your-ai-library'); n


// Load models
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

console.log('Review module loaded successfully');
const session = require('express-session');
const flash=require("connect-flash");
// Database connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/ghar";

const dbURI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Database connection error:', err));

// Middleware setup
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// const sessionOptions = {
//   secret: "mysecretcode",
//   resave: false,
//   saveinitialised: true, // Incorrect
//   cookie: {
//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//   },
// };
// Define the store variable before using it in session options
const store = MongoStore.create({
  mongoUrl: dbURI,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600,
});

// Corrected Session Options
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true, // Fixed typo
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Improved error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";
  res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
});


const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
app.use(express.json());
  

app.get("/chat", (req, res) => {
  res.render("chat.ejs"); // Render a chat interface page
});

app.post('/generate-text', async (req, res) => {
  try {
      const prompt = req.body.prompt; // Assuming you send the prompt in the request body
      const response = await model.createCompletion({
          prompt: prompt,
          maxTokens: 100 // Set the max tokens based on your requirement
      });

      res.json({ text: response.data.choices[0].text });
  } catch (error) {
      console.error("Error with AI model:", error);
      res.status(500).send("Error generating text");
  }
});


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
  console.log('Current User in Middleware:', req.user);
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})
const saveurl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

app.use(saveurl);

// Root Route
// Root Route
app.get("/", (req, res) => {
  res.render("home.ejs")

});


// Middleware to validate ObjectId
function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (mongoose.Types.ObjectId.isValid(id)) {
    return next();
  }
  res.status(400).send("Invalid ID");
}

app.get("/listings", wrapAsync(async (req, res) => {
  try {
      const { minPrice, maxPrice ,search,country} = req.query;

      let filter = {};

      if (minPrice || maxPrice) {
          filter.price = {};
          if (minPrice) {
              filter.price.$gte = parseInt(minPrice);
          }
          if (maxPrice) {
              filter.price.$lte = parseInt(maxPrice);
          }
          
      }
      if (search) {
        filter.$or = [
            { 'title': new RegExp(search, 'i') }, // Assuming you want to search by title
            { 'description': new RegExp(search, 'i') } // Optionally search by description
        ];
    } 
    
     
    if (country) {
      filter.country = new RegExp(country, 'i'); // Case-insensitive match
  }

      
      const filteredListings = await Listing.find(filter);


      // Render the page after allListings is initialized
      res.render("listings/index", { allListings: filteredListings });
  } catch (err) {
      console.error(err);
      req.flash("error", "There was a problem fetching the listings");
      res.redirect("/");
  }
}));

// app.js or routes.js
// assuming Listing is your model

// Route to get listing's availability data
app.get('/listings/:id/availability', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        const availability = listing.availability; // Assuming this contains available and booked dates
        res.json(availability); // Send the availability data as JSON
    } catch (e) {
        console.error(e);
        res.status(500).send('Error fetching availability');
    }
});

// module.exports = app;





// New Route
app.get("/listings/new", (req, res) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
      req.flash("error","you must be logged in")
      return res.redirect("/login")
  }
  
  res.render("listings/new.ejs");
});
app.get("/submit-contact",(req,res)=>{
  res.send("Response has been recorded");
})
// Show Route
app.get("/listings/:id", validateObjectId, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author",},}).populate("owner").exec();
  if (!listing) {
     res.status(404).send("Listing not found");
     req.flash("error","Listing does not exist");
     res.redirect("/listings")
  }
  console.log(listing)
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", wrapAsync(async (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in");
    return res.redirect("/login");
  }

  const { error } = listingSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.message);
  }
  
  const newListing = new Listing(req.body.listing); // This is likely where the error is
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "New listing created successfully");
  res.redirect("/listings");
}));

// app.post("/listings", upload.single('listing[image]'), wrapAsync(async (req, res) => {
//   if (!req.isAuthenticated()) {
//     req.session.redirectUrl = req.originalUrl;
//     req.flash("error", "You must be logged in");
//     return res.redirect("/login");
//   }

//   // Log the request body and file
//   console.log('Request Body:', req.body);
//   console.log('Uploaded File:', req.file);

//   // Check for file upload
//   if (!req.file) {
//     req.flash("error", "No file uploaded");
//     return res.redirect("/listings/new");
//   }

//   // Validate and process the rest of the listing data
//   const { error } = listingSchema.validate(req.body);
//   if (error) {
//     throw new ExpressError(400, error.message);
//   }

//   // Handle file and other data
//   // Example:
//   // const newListing = new Listing(req.body.listing);
//   // newListing.owner = req.user._id;
//   // newListing.image = req.file.path; // Save file path or URL if necessary
//   // await newListing.save();

//   res.send(req.file);
// }));


// Edit Route
app.get("/listings/:id/edit", validateObjectId, wrapAsync(async (req, res) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","you must be logged in");
    return res.redirect("/login");
  }
  let { id } = req.params;
  let listing = await Listing.findById(id);
  
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error", "You do not have the right to edit");
    return res.redirect("/listings/${id}");   
  }

  if (!listing) {
    req.flash("error","Listing does not exist");
    return res.redirect("/listings");
  }
  
  res.render("listings/edit.ejs", { listing });
}));


// Update Route
app.put("/listings/:id", validateObjectId, wrapAsync(async (req, res) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have the right to edit");
    return res.redirect("/listings/${id}");
  }

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated");
  res.redirect("/listings/${id}");
}));


// Delete Route
app.delete("/listings/:id", validateObjectId, wrapAsync(async (req, res) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","you must be logged in");
    return res.redirect("/login");
  }
  
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You do not have the right to delete");
    return res.redirect("/listings/${id}");
  }

  const deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Deleted listing successfully");
  res.redirect("/listings");
}));


// Reviews - Create
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
  if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
      req.flash("error","you must be logged in")
      return res.redirect("/login")
  }
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  console.log(newReview);
  newReview.author=req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  console.log("Review saved");
  req.flash("success","New Review created successfully")
  res.redirect("/listings/${listing._id}");
}));

// Reviews - Delete
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success"," Delete review successfully")
  res.redirect("/listings/${id}");
}));
//signup 
app.get("/signup",(req,res)=>{
  res.render("user/signUp.ejs")
})
//post
app.post("/signup", async (req, res) => {

  try{
    let { username, email, password } = req.body;
  const newUser = new User({ email, username }); 
  const registeredUser = await User.register(newUser, password);
  console.log(registeredUser);
  req.login(registeredUser,(err)=>{
    if(err){
      return next(err);
    } req.flash("success", "Welcome to Ghar.com");
    res.redirect("/listings");

  })
 
  }
  catch(e) {
    req.flash("error", e.message); // Display the actual error message
    res.redirect("/signup");
  }
  
});

app.get("/login",(req,res)=>{
  res.render("user/login.ejs")
})
//login post
app.post("/login",saveurl, passport.authenticate('local', { 
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  req.flash("success", "Welcome to Ghar.com, you are successfully logged in");
  let redirect=res.locals.redirectUrl||"/listings"
  res.redirect(redirect);
});
app.get("/logout",(req,res)=>{
  req.logout((logout)=>{
    // if(err){
    //   return next(err)
    // }
    req.flash("success","you log out successfully");
    res.redirect("/listings");
  });
})



//About us page
app.get('/about', (req, res) => {
  res.render('about.ejs'); // Renders the about.ejs template
});

app.get('/Team', (req, res) => {
  res.render('team.ejs'); // Renders the about.ejs template
});
app.get('/mission', (req, res) => {
  res.render('mission.ejs'); // Renders the about.ejs template
});
app.get('/updates', (req, res) => {
  res.render('updates.ejs'); // Renders the about.ejs template
});
app.get('/terms', (req, res) => {
  res.render('terms.ejs'); // Renders the about.ejs template
});
app.get('/privacy', (req, res) => {
  res.render('privacy.ejs'); // Renders the about.ejs template
});
app.get('/setup', (req, res) => {
  res.render('setup.ejs'); // Renders the about.ejs template
});
app.get('/help', (req, res) => {
  res.render('help.ejs'); // Renders the about.ejs template
});
app.get('/app', (req, res) => {
  res.render('app.ejs'); // Renders the about.ejs template
});
app.get('/transaction', (req, res) => {
  res.render('transaction.ejs'); // Renders the about.ejs template
});
app.get('/ad', (req, res) => {
  res.render('ad.ejs'); // Renders the about.ejs template
});
app.get('/affeliate', (req, res) => {
  res.render('affeliate.ejs'); // Renders the about.ejs template
});
app.get('/market', (req, res) => {
  res.render('market.ejs'); // Renders the about.ejs template
});
app.get('/propertyowner', (req, res) => {
  res.render('propertyowner.ejs'); // Renders the about.ejs template
});
app.get('/learnmore', (req, res) => {
  res.render('learnmore.ejs'); // Renders the about.ejs template
});
app.get('/newsletter', (req, res) => {
  res.render('newsletter.ejs'); // Renders the about.ejs template
});


// 404 Route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// Server setup
app.listen(3000, () => {
  console.log("Server is listening on port 3000");
}); 


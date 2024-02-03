var express = require("express");
var router = express.Router();
var adhelpers = require("../helpers/admin-helpers");
var userhelp = require("../helpers/user-enroll-helpers");
const { response } = require("../app");
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("login");
});

router.get("/create", function (req, res, next) {
  res.render("create-acc");
});

router.get("/dashboard", verifyLogin, (req, res) => {
  //console.log(req.query.id)
  userhelp.getParticipantNames().then((response)=>{
    console.log(response);
    res.render('admin-dashboard',{response});
  })
  
});

router.get("/user-enroll",verifyLogin,(req,res)=>{
    res.render("userenroll");
})

router.get("/delete-user", (req, res) => {
    const userId = req.query.id;
  userhelp.deleteuser(userId).then((response)=>{
    console.log(response);
  })
    res.redirect('/admin/dashboard');

  });

  router.get("/view-user", (req, res) => {
    const userId = req.query.id;
  userhelp.displayuser(userId).then((response)=>{
    if(response.completed){
      console.log(response)
      response.attempts=response.attempts
      response.timer=response.timer

    }
    console.log(response)
    res.render("view-user",{response})
  })
    //res.redirect('/admin/dashboard');

  });

router.post("/create", (req, res) => {
  //console.log(req.query.id)
  console.log('hi')

  console.log(req.body);
  adhelpers.register(req.body).then((response) => {
    console.log(response);
    res.redirect("/admin");
  });
});



router.post("/", (req, res) => {
  adhelpers
    .login(req.body)
    .then((response) => {
      console.log(response);

      if (response.success) {
        req.session.loggedIn = true;

        res.json({ success: true });
      } else {
        // Login failed
        res.json({ success: false });
      }
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    });
});

router.post("/user-enroll",verifyLogin,(req,res)=>{
    userhelp.register(req.body).then((response)=>{
        console.log("Successfully created the user");
        console.log(response);
        res.redirect("/admin/dashboard");
    });
})

module.exports = router;

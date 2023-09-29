//require express, express router and bcrypt as shown in lecture code
const e = require("express");
const express = require("express");
const router = express.Router();
const userss = require("../data/users");

router.route("/").get(async (req, res) => {
  //code here for GET
  if (req.session.user) {
    res.redirect("/protected");
  } else {
    res.render("userLogin", { title: "login" });
  }
});

router
  .route("/register")
  .get(async (req, res) => {
    //code here for GET
    if (req.session.user) {
      res.redirect("/protected");
    } else {
      res.render("userRegister", { title: "register" });
    }
  })
  .post(async (req, res) => {
    //code here for POST
    //get data and save to database
    const user_data = req.body.usernameInput;
    const password_data = req.body.passwordInput;
    // res.render("userRegister", { user: data });

    console.log("user_data", user_data);
    console.log("password_data", password_data);

    try {
      //Create a User by sending u and p.
      var registration_response = await userss.createUser(
        user_data,
        password_data
      );
      console.log("registration_response", registration_response);

      if ("inserted_user" in registration_response) {
        res.redirect("/");
      } else if ("user_exists" in registration_response) {
        res.status(400);
        res.render("userRegister", {
          title: "register",
          error_msg: " User Already Exist",
        });
      } else if ("validation_error" in registration_response) {
        res.status(400);
        res.render("userRegister", {
          title: "register",
          error_msg: registration_response.validation_error,
        });
      } else {
        res.status(500);
        res.render("userRegister", {
          title: "register",
          error_msg: "Internal Server Error",
        });
      }
    } catch (e) {
      console.log(e);
    }
  });

router.route("/login").post(async (req, res) => {
  //code here for POST
  //get login info, verify and then create session and redirect to private page
  //code here for POST
  //get data and save to database
  const user_data = req.body.usernameInput;
  const password_data = req.body.passwordInput;
  // res.render("userRegister", { user: data });

  console.log("user_data", user_data);
  console.log("password_data", password_data);

  try {
    //Create a User by sending u and p.
    var registration_response = await userss.checkUser(
      user_data,
      password_data
    );
    console.log("registration_response", registration_response);

    if ("authenticatedUser" in registration_response) {
      //create a session
      req.session.user = user_data;
      res.redirect("/");
    } else if ("validation_error" in registration_response) {
      res.status(400);
      res.render("userLogin", {
        title: "login",
        error_msg: registration_response.validation_error,
      });
    }
  } catch (e) {
    console.log(e);
  }
});

router.route("/protected").get(async (req, res) => {
  //code here for GET
  date_time = Date();
  if (req.session.user) {
    res.render("private", {
      title: "Welcome",
      date_time: date_time,
      user: req.session.user,
    });
  } else {
    res.render("forbiddenAccess", { title: "Error" });
  }
  //check if user is logged in
  //if yes -
  // if no
});

router.route("/logout").get(async (req, res) => {
  //code here for GET
  //Destroy session
  req.session.destroy();
  res.render("logout", { title: "Logout" });
});
module.exports = router;

var express = require("express");
var router = express.Router();
var userhelp = require("../helpers/user-enroll-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.usrloggedIn) {
    next();
  } else {
    res.redirect("/auth-game");
  }
};
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/auth-game", function (req, res, next) {
  res.render("auth");
});

router.get("/game", verifyLogin, function (req, res, next) {
  const storedUserDocument = req.cookies.userDocument;
  const deserializedUserDocument = JSON.parse(storedUserDocument);
  // console.log(deserializedUserDocument._id);

  res.render("game", {
    userId: deserializedUserDocument._id,
    username: deserializedUserDocument.participantname,
  });
});

router.get("/success-page", (req, res) => {
  const time = req.query.time || "N/A";
  const attempts = req.query.attempts || "N/A";
  const storedUserDocument = req.cookies.userDocument;
  const deserializedUserDocument = JSON.parse(storedUserDocument);
  const participantId = String(deserializedUserDocument._id);
  console.log(participantId);
  userhelp.markParticipantcompleted(participantId, time, attempts);
  req.session.usrloggedIn = false;
  res.clearCookie("userDocument");
  res.render("success-page", { time, attempts });
});

router.get("/fail-page", (req, res) => {
  req.session.usrloggedIn = false;
  res.clearCookie("userDocument");
  //console.log(req.cookies.userDocument);
  res.render("failure");
});

router.post("/verify-otp", (req, res) => {
  try {
    const storedUserDocument = req.cookies.userDocument;
    const deserializedUserDocument = JSON.parse(storedUserDocument);

    // Convert randomnum to a string
    var serverOTP = String(deserializedUserDocument.randomnum);

    console.log(req.body.timer);
    const userOTP = req.body.otp;
    //let hint = "";
    //let repetition = "";

    if (userOTP === serverOTP) {
      // If OTPs match, render the user to the success page
      const redirectUrl = `/success-page?time=${req.body.timer}&attempts=${req.body.attempts}`;
      // In your server-side /verify-otp route handler
      res.status(200).json({
        success: true,
        hint: hint,
        redirectUrl: `/success-page?time=${500 - req.body.timer}&attempts=${
          35 - req.body.attempts
        }`,
      });
    } else {
      // Initialize the hint string
      let server_otp = serverOTP.split("");
      console.log(server_otp[0]);

      console.log(userOTP[0]);

      var hint = "";
      var k = 0;
      let nonrepeat = [];
      let prevent_repeat = [];
      let check = 0;

      for (var i = 0; i < server_otp.length; i++) {
        check = 0;
        k = 0;
        if (server_otp[i] === userOTP[i]) {
          hint += "!";
          k = i + 1;
          while (k < server_otp.length) {
            if (server_otp[i] == server_otp[k]) {
              check = 1;
              console.log("repetition at index ", k);
              break;
            }

            k++;
          }
          if (check == 0) {
            nonrepeat.push(server_otp[i]);
          }
          server_otp[i] = "x";
        } else {
          // hint += ' ';
        }
      }

      serverOTP = server_otp.join("");
      console.log(serverOTP);

      for (let i = 0; i < userOTP.length; i++) {
        let currentDigit = userOTP[i];

        // Check if the current digit is already in prevent_repeat array
        if (prevent_repeat.includes(currentDigit)) {
          continue; // Skip the linear search for this digit
        }

        // Linear search on serverOTP for the current digit
        let index = serverOTP.indexOf(currentDigit);

        if (index !== -1) {
          hint += ".";
          prevent_repeat.push(currentDigit);
        }
      }
      // Send the hint as a response
      res.status(200).json({ success: true, hint: hint });
    }
  } catch (error) {
    console.error("Error processing /verify-otp:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

// router.post('/verify-otp', (req, res) => {
//   try {
//     const storedUserDocument = req.cookies.userDocument;
//     const deserializedUserDocument = JSON.parse(storedUserDocument);

//     // Convert randomnum to a string
//     const serverOTP = String(deserializedUserDocument.randomnum);

//     console.log(req.body.timer);
//     const userOTP = req.body.otp;
//     let hint = '';

//     // Declare hint outside of the if/else block

//     if (userOTP === serverOTP) {
//       // If OTPs match, render the user to the success page
//       const redirectUrl = `/success-page?time=${req.body.timer}&attempts=${req.body.attempts}`;
//       // In your server-side /verify-otp route handler
//       res.status(200).json({
//         success: true,
//         hint: hint,
//         redirectUrl: `/success-page?time=${req.body.timer}&attempts=${req.body.attempts}`
//     });

// // You can also use res.render if rendering a view directly
//     } else {
//       // Initialize the hint string
//       for (let i = 0; i < userOTP.length; i++) {
//         const userDigit = userOTP[i];

//         if (serverOTP.includes(userDigit)) {
//           // Digit is present in serverOTP
//           if (serverOTP[i] === userDigit) {
//             // Correct position
//             hint += '!';
//           } else {
//             // Correct digit but wrong position
//             hint += '.';
//           }
//         } else {
//           // Digit is not present in serverOTP
//           // You can handle this case accordingly, e.g., by adding 'X' to the hint
//           // hint += 'X';
//         }
//       }
//     }

//     console.log(hint);

//     // Send the hint as a response
//     res.status(200).json({ success: true, hint: hint });
//   } catch (error) {
//     console.error('Error processing /verify-otp:', error);
//     res.status(500).json({ success: false, error: 'Internal server error.' });
//   }
// });

router.post("/auth-game", async function (req, res, next) {
  console.log(req.body);

  try {
    const response = await userhelp.login(req.body);

    if (response.attempted === false) {
      await userhelp.markParticipantAttempted(response._id);

      req.session.usrloggedIn = true;
      console.log(response);

      const simplifiedUserObject = {
        _id: response._id,
        randomnum: response.randomnum,
        participantname: response.participantname,
      };

      // Serialize the simplified user object to a string and save it in the cookie
      const serializedSimplifiedUserObject =
        JSON.stringify(simplifiedUserObject);
      res.cookie("userDocument", serializedSimplifiedUserObject, {
        maxAge: 500000,
        httpOnly: true,
      });

      res.json({ success: true, redirect: "/game" });
    } else {
      res.json({
        success: false,
        message: "You have already attempted the task. Contact the admin.",
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

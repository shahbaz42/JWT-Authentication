const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./model");
const ejs = require("ejs");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const authorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, "YOUR_SECRET_KEY");
    req.userId = data.id;
    req.email = data.email;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};


app.get("/", (req, res) => {
  res.render("home");
});


app.get("/signUp", (req, res) => {
  res.render("signup");
});


app.post("/signUp", (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, saltRounds, function (err, hash) {

    const user = new User({
      email,
      password: hash
    });

    user.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/login");
      }
    });
  });
});


app.get("/login", (req, res) => {
  res.render("login");
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      if (!user) {
        res.redirect("/login");
      } else {
        bcrypt.compare(password, user.password, function (err, result) {
          if (result == true) {
            const token = jwt.sign(
              { id: user._id, email: user.email },
              "YOUR_SECRET_KEY"
            );
            res.cookie("access_token", token, {
              maxAge: 1000 * 60 * 60 * 24 * 7,
              httpOnly: true
            });
            res.redirect("/");
          } else {
            console.log("password is not matching. ");
            res.redirect("/login");
          }
        });
      }
    }
  });
});


app.get("/protected", authorization, (req, res) => {
  return res.json({ user: { id: req.userId, email: req.email } });
});


app.get("/logout", authorization, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out . " });
});


const start = (port) => {
  try {
    app.listen(port, () => {
      console.log(`Api up and running at: http://localhost:${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit();
  }
};


start(3333);

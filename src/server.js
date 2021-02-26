const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
// const listEndpoints = require("express-list-endpoints");

const usersRoute = require("./services/user");
const { httpErrorHandler } = require("./utils");

const server = express();
const port = process.env.PORT || 3001;

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

server.use(helmet());
server.use(cors({ credentials: true, origin: process.env.FE_URL_PROD }));
server.use(express.json());
server.use(cookieParser());
server.use(passport.initialize());

server.use(loggerMiddleware);

server.use("/users", usersRoute);
server.use(httpErrorHandler);

// console.log(listEndpoints(server));

mongoose
  .connect(
    process.env.MONGO_CONNECTION,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
    { autoIndex: false }
  )
  .then(() =>
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch((err) => console.log(err));

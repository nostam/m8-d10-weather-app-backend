const passport = require("passport");
const usersRouter = require("express").Router();

const UserModel = require("./schema");
const {
  APIError,
  accessTokenOptions,
  refreshTokenOptions,
} = require("../../utils");
const { fetchWeatherAndBackground } = require("../../utils/api");

const { authorize } = require("../auth/middlewares");
const { authenticate } = require("../auth");

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    const user = await UserModel.findByCredentials(username, password);

    const { accessToken, refreshToken } = await authenticate(user);
    res
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .status(201)
      .send("Welcome back");
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    next(new APIError("Refresh token missing", 400));
  } else {
    try {
      const { accessToken, refreshToken } = await refreshToken(oldRefreshToken);
      res
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .send("renewed");
    } catch (error) {
      next(error);
    }
  }
});

usersRouter.post("/logout", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== req.cookies.refreshTokens
    );
    await req.user.save();
    //TODO update domain options for deployment | RT clear fail?
    res.clearCookie("accessToken").clearCookie("refreshToken").send();
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/logoutAll", authorize, async (req, res, next) => {
  try {
    console.log(req.user);
    req.user.refreshTokens = [];
    await req.user.save();
    //TODO update domain options for deployment | RT clear fail?
    res.clearCookie("accessToken").clearCookie("refreshToken").send();
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res
        .cookie("accessToken", req.user.tokens.accessToken, accessTokenOptions)
        .cookie(
          "refreshToken",
          req.user.tokens.refreshToken,
          refreshTokenOptions
        )
        .redirect(`${process.env.FE_URL_PROD}`);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter
  .route("/me")
  .get(authorize, async (req, res, next) => {
    try {
      const data = await fetchWeatherAndBackground(req.user);
      res.send(data);
    } catch (error) {
      next(error);
    }
  })
  .put(authorize, async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  })
  .delete(authorize, async (req, res, next) => {
    try {
      await req.user.deleteOne();
      res.status(204).send("Deleted");
    } catch (error) {
      next(error);
    }
  });

module.exports = usersRouter;

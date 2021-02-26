const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      rquired: [true, "Username required"],
      minlength: [3, "Username is too short"],
      validate: {
        validator: async function (username) {
          const user = await this.constructor.findOne({ username });
          if (user && user.username === this.username) return true;
          return !user ? true : false;
        },
        message: "Username is taken",
      },
    },
    password: String,
    favourites: [
      {
        city: { type: String },
        country: { type: String },
        lat: { type: Number },
        lon: { type: Number },
      },
    ],
    googleId: String,
    refreshTokens: [{ token: { type: String } }],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

module.exports = model("user", UserSchema);

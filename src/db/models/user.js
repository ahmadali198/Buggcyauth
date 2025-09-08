// models/user.js
"use strict";

const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name cannot be empty" },
          len: { args: [2, 100], msg: "Name must be between 2 and 100 characters" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: "Must be a valid email address" },
          notEmpty: { msg: "Email cannot be empty" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // nullable for OAuth users
        validate: {
          len: { args: [6, 255], msg: "Password must be at least 6 characters" },
        },
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "local",
        validate: {
          isIn: { args: [["local", "google"]], msg: "Provider must be either local or google" },
        },
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: { args: [13], msg: "Age must be at least 13" },
          max: { args: [120], msg: "Age must be less than 120" },
        },
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other", "prefer-not-to-say"),
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.TEXT, // file path or base64
        allowNull: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Users",
      timestamps: true,
      // hooks: {
      //   beforeCreate: async (user) => {
      //     if (user.password) {
      //       const saltRounds = 12;
      //       user.password = await bcrypt.hash(user.password, saltRounds);
      //     }
      //   },
      //   beforeUpdate: async (user) => {
      //     if (user.changed("password") && user.password) {
      //       const saltRounds = 12;
      //       user.password = await bcrypt.hash(user.password, saltRounds);
      //     }
      //   },
      // },
    }
  );

  User.associate = function (models) {
    // define associations here if needed
  };

  // Instance methods
  User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };

  // Class methods
  User.findByEmail = function (email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findByGoogleId = function (googleId) {
    return this.findOne({ where: { googleId } });
  };

  return User;
};

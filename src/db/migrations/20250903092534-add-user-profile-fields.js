
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add age column
    await queryInterface.addColumn('Users', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Add gender column with ENUM
    await queryInterface.addColumn('Users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other', 'prefer-not-to-say'),
      allowNull: true,
    });

    // Add profile picture column
    await queryInterface.addColumn('Users', 'profilePicture', {
      type: Sequelize.TEXT, // TEXT to store base64 data or file paths
      allowNull: true,
    });

    // Add email verified column
    await queryInterface.addColumn('Users', 'emailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });

    // Add last login timestamp
    await queryInterface.addColumn('Users', 'lastLoginAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Make email unique if it's not already
    try {
      await queryInterface.addIndex('Users', ['email'], {
        unique: true,
        name: 'users_email_unique'
      });
    } catch (error) {
      // Index might already exist, ignore error
      console.log('Email unique index might already exist:', error.message);
    }

    // Make name not nullable
    await queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Make email not nullable  
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added columns in reverse order
    await queryInterface.removeColumn('Users', 'lastLoginAt');
    await queryInterface.removeColumn('Users', 'emailVerified');
    await queryInterface.removeColumn('Users', 'profilePicture');
    await queryInterface.removeColumn('Users', 'gender');
    await queryInterface.removeColumn('Users', 'age');

    // Remove unique index
    try {
      await queryInterface.removeIndex('Users', 'users_email_unique');
    } catch (error) {
      console.log('Could not remove index:', error.message);
    }

    // Revert column changes
    await queryInterface.changeColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
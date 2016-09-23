if (!process.env.SKIP_DOTENV) {
  require('dotenv').load();
}

const Mongoose = require('mongoose');
const Inquirer = require('inquirer');
const User = require('../core/api/users/model/user');
const hashPassword = require('../core/api/users/utils/userFunctions').hashPassword;

Mongoose.connect(process.env.MONGO_URL + process.env.MONGO_DB, {
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS
}, (dbError) => {
  if (dbError) {
    throw dbError;
  }

  Inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Please insert a username'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Please insert a email'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Please set a password for this user'
    }
  ]).then(function (answers) {

    let user = new User();
    user.username = answers.username;
    user.email = answers.email;

    hashPassword(answers.password, (error, hash) => {
      if (error) {
        process.exit(error);
      }

      user.password = hash;

      user.save((userError, newUser) => {
        if (userError) {
          process.exit(userError);
        }

        console.log(`User '${answers.username}' is now created.`);

        process.exit();
      });
    });
  });
});

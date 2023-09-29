const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const { ObjectId } = require("mongodb");
var bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

//space check
function hasWhiteSpace(s) {
  return s.indexOf(" ") >= 0;
}
//alpha numeric
function onlyLettersAndNumbers(str) {
  return /^[A-Za-z0-9]*$/.test(str);
}
//checking Password must have at least one uppercase character, one number and  one special character.
function checkPassword(str) {
  return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{6,}$/.test(str);
}

const createUser = async (username, password) => {
  //validate data first
  username = username.toLowerCase();
  if (username.length < 4) {
    return {
      validation_error: "The length of the Username must be greater than 4 ",
    };
  }
  if (hasWhiteSpace(username)) {
    return {
      validation_error: "Username must not contain space character",
    };
  }
  if (onlyLettersAndNumbers(username) == false) {
    return {
      validation_error: "Username must be Alphanumeric",
    };
  }
  if (checkPassword(password) == false) {
    return {
      validation_error:
        "Password must have at least one uppercase character, one number and  one special character.",
    };
  }
  if (hasWhiteSpace(password)) {
    return {
      validation_error: "Password must not contain space character",
    };
  }
  if (password.length < 6) {
    return {
      validation_error: "The length of the Password must be greater than 6 ",
    };
  }
  //verify user does not exist in db
  doesUserExist = await getUserByUsername(username);

  if (doesUserExist == null) {
    //user does not exist, therefore save record
    let new_user;
    new_user = {
      username: username,
      password: bcrypt.hashSync(password, salt),
    };
    console.log("new_user", new_user);
    const userCollection = await users();

    const insertInfo = await userCollection.insertOne(new_user);
    if (!insertInfo.insertedId) throw "Could not add user";

    const inserted_user = await getUserById(insertInfo.insertedId);
    console.log("inserted_user", inserted_user);
    return { inserted_user: true };
  } else {
    return { user_exists: true };
  }

  return { error: true };
};

const checkUser = async (username, password) => {
  //if user finds in db, return true
  username = username.toLowerCase();
  if (username.length < 4) {
    return {
      validation_error: "The length of the Username must be greater than 4 ",
    };
  }
  if (hasWhiteSpace(username)) {
    return {
      validation_error: "Username must not contain space character",
    };
  }
  if (hasWhiteSpace(password)) {
    return {
      validation_error: "Password must not contain space character",
    };
  }
  if (password.length < 6) {
    return {
      validation_error: "The length of the Password must be greater than 6 ",
    };
  }

  var userCheck = await getUserByUsername(username);
  if (userCheck == null) {
    return {
      validation_error: "Either the username or password is invalid",
    };
  } else {
    //verify password
    var pwdValid = bcrypt.compareSync(password, userCheck.password); // true
    if (pwdValid == true) {
      //login success
      return { authenticatedUser: true };
    } else {
      //invalid password
      return {
        validation_error: "Either the username or password is invalid",
      };
    }
  }
};

const getUserByUsername = async (username) => {
  const userCollection = await users();
  const user = await userCollection.findOne({ username: username });
  console.log("getUserByUsername", user);

  return user;
};

const getUserById = async (id) => {
  const userCollection = await users();
  const userr_id = await userCollection.findOne({ _id: ObjectId(id) });
  return userr_id;
};

module.exports = { createUser, checkUser };

const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const dbPath = path.join(__dirname, 'twitterClone.db')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(express.json())

let DB = null

const initializationServerAndDb = async () => {
  try {
    DB = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (err) {
    console.log(`DB ERROR: ${err.message}`)
    process.exit(1)
  }
}
initializationServerAndDb()

//AUTHORIZATION TOKEN

const authorizationToken = (request, response, next) => {
  const {tweet} = request.body
  const {tweetId} = request.params
  let jwtToken
  const authorHeader = request.headers['authorization']
  if (authorHeader === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwtToken = authorHeader.split(' ')[1]

    if (jwtToken === undefined) {
      response.status(401)
      response.send('Invalid JWT Token')
    } else {
      jwt.verify(jwtToken, 'SECRET_KEY', async (error, payload) => {
        if (error) {
          response.status(401)
          response.send('Invalid JWT Token')
        } else {
          request.username = payload.username
          request.userId = payload.userId
          request.tweet = tweet
          request.payload = payload
          request.tweetId = tweetId
          next()
        }
      })
    }
  }
}

//AUTHENTICATETOKEN
const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }
  if (jwtToken === undefined) {
    response.status(401)
    response.send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'MY_SECRET_TOKEN', async (error, payload) => {
      if (error) {
        response.status(401)
        response.send('Invalid JWT Token')
      } else {
        request.username = payload.username
        next()
      }
    })
  }
}
//User registration and login with secure password storage and hashing , Error handling and logging of API requests and responses.

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body
  const checkUser = `
  SELECT
  *
  FROM 
  user
  WHERE
  username = '${username}';`

  const dbUser = await DB.get(checkUser)

  if (dbUser !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else {
    if (password.length < 6) {
      response.status(400)
      response.send('Password is too short')
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      const createUserQuery = `
        INSERT INTO 
        user
        (username, password, name, gender)
        VALUES
        ('${username}', '${hashedPassword}', '${name}', '${gender}');`

      await DB.run(createUserQuery)
      response.send('User created successfully')
    }
  }
})

app.post('/login/', async (request, response) => {
  const {username, password} = request.body
  console.log(username)
  console.log(password)
  const checkUser = `
    SELECT
    *
    FROM
    user
    WHERE
    username = '${username}';`

  const dbUser = await DB.get(checkUser)

  if (dbUser !== undefined) {
    const passwordMatch = await bcrypt.compare(password, dbUser.password)
    if (passwordMatch === true) {
      const jwtToken = jwt.sign(dbUser, 'SECRET_KEY')
      response.send({jwtToken})
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  } else {
    response.status(400)
    response.send('Invalid user')
  }
})

//CRUD functionality for managing data in a database.

app.get('/users/', async (request, response) => {
  const getUsersQuery = `
    SELECT
      *
    FROM
      user
    ORDER BY
      user_id;`
  const usersArray = await DB.all(getUsersQuery)
  response.send(usersArray)
})

app.put('/user/:userId/', async (request, response) => {
  const {userId} = request.params
  const userDetails = request.body
  const {name, username, password, gender} = userDetails
  const updateUserQuery = `
    UPDATE
      user
    SET
      name='${name}',
      username=${username},
      password=${password},
      gender=${gender}
    WHERE
      user_id = ${userId};`
  await DB.run(updateUserQuery)
  response.send('User Updated Successfully')
})

app.post('/user/', async (request, response) => {
  const userDetails = request.body
  const {name, username, password, gender} = userDetails
  const addUserQuery = `
    INSERT INTO
      user (name,username,password,gender)
    VALUES
      (
        '${name}',
         ${username},
         ${password},
         ${gender}
      );`

  const dbResponse = await DB.run(addUserQuery)
  const userId = dbResponse.lastID
  response.send({userId: userId})
})

app.delete('/user/:userId/', async (request, response) => {
  const {userId} = request.params
  const deleteUserQuery = `
    DELETE FROM
      user
    WHERE
      user_id = ${userId};`
  await DB.run(deleteUserQuery)
  response.send('User Deleted Successfully')
})

//Authentication and authorization of requests using JWT tokens.

app.get('/user/tweets/feed/', authorizationToken, async (request, response) => {
  const {username} = request

  const followingPeopleIds = await getFollowingPeopleIdsOfUser(username)

  const getTweetQuery = `
    SELECT
    username, tweet, date_time as dateTime
    FROM user 
    INNER JOIN tweet
    ON user.user_id = tweet.user_id
    WHERE
    user.user_id IN (${followingPeopleIds})
    ORDER BY date_time DESC
    LIMIT 4 ;`

  const tweets = await DB.all(getTweetQuery)
  response.send(tweets)
})

app.get('/user/', authenticateToken, async (request, response) => {
  let {username} = request
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`
  const userDetails = await DB.get(selectUserQuery)
  response.send(userDetails)
})

//The ability to search and filter data based on user-defined parameters.
//Pagination and sorting of data.
app.get('/users/', async (request, response) => {
  const {
    offset = 2,
    limit = 5,
    order = 'ASC',
    order_by = 'user_id',
    search_q = '',
  } = request.query
  const getUsersQuery = `
    SELECT
      *
    FROM
     user
    WHERE
     username LIKE '%${search_q}%'
    ORDER BY ${order_by} ${order}
    LIMIT ${limit} OFFSET ${offset};`
  const usersArray = await DB.all(getUsersQuery)
  response.send(usersArray)
})

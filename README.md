# Twitter Clone API

This document provides an overview of the Twitter Clone API endpoints, their methods, and the scenarios with expected responses.

## Table of Contents

1. [Registration](#registration)
2. [Login](#login)
3. [JWT Authentication Middleware](#jwt-authentication-middleware)
4. [User Endpoints](#user-endpoints)
    - [User Feed](#user-feed)
    - [Following List](#following-list)
    - [Followers List](#followers-list)
    - [User Tweets](#user-tweets)
5. [Tweet Endpoints](#tweet-endpoints)
    - [Get Tweet](#get-tweet)
    - [Get Tweet Likes](#get-tweet-likes)
    - [Get Tweet Replies](#get-tweet-replies)
    - [Create Tweet](#create-tweet)
    - [Delete Tweet](#delete-tweet)
6. [Setup and Installation](#setup-and-installation)

## Registration

### Endpoint
`POST /register/`

### Scenarios

1. **Username already exists**
    - **Status Code:** 400
    - **Body:** `User already exists`

2. **Password too short**
    - **Status Code:** 400
    - **Body:** `Password is too short`

3. **Successful registration**
    - **Status Code:** 201
    - **Body:** `User created successfully`

## Login

### Endpoint
`POST /login/`

### Scenarios

1. **Invalid user**
    - **Status Code:** 400
    - **Body:** `Invalid user`

2. **Incorrect password**
    - **Status Code:** 400
    - **Body:** `Invalid password`

3. **Successful login**
    - **Status Code:** 200
    - **Body:** `{ "token": "JWT_TOKEN_HERE" }`

## JWT Authentication Middleware

### Scenarios

1. **No or invalid JWT token**
    - **Status Code:** 401
    - **Body:** `Invalid JWT Token`

2. **Valid JWT token**
    - Proceed to the next middleware or handler

## User Endpoints

### User Feed

### Endpoint
`GET /user/tweets/feed/`

### Description
Returns the latest tweets of people whom the user follows, with a maximum of 4 tweets at a time.

### Response
- **Status Code:** 200
- **Body:** `{ "tweets": [ { "id": "tweetId", "content": "tweetContent", "user": "username", "dateTime": "date-time" }, ... ] }`

### Following List

### Endpoint
`GET /user/following/`

### Description
Returns the list of names of people whom the user follows.

### Response
- **Status Code:** 200
- **Body:** `{ "following": ["username1", "username2", ...] }`

### Followers List

### Endpoint
`GET /user/followers/`

### Description
Returns the list of names of people who follow the user.

### Response
- **Status Code:** 200
- **Body:** `{ "followers": ["username1", "username2", ...] }`

### User Tweets

### Endpoint
`GET /user/tweets/`

### Description
Returns a list of all tweets of the user.

### Response
- **Status Code:** 200
- **Body:** `{ "tweets": [ { "id": "tweetId", "content": "tweetContent", "dateTime": "date-time" }, ... ] }`

## Tweet Endpoints

### Get Tweet

### Endpoint
`GET /tweets/:tweetId/`

### Scenarios

1. **Invalid request (not following the user)**
    - **Status Code:** 401
    - **Body:** `Invalid Request`

2. **Valid request (following the user)**
    - **Status Code:** 200
    - **Body:** `{ "tweet": "tweetContent", "likes": likesCount, "replies": repliesCount, "dateTime": "date-time" }`

### Get Tweet Likes

### Endpoint
`GET /tweets/:tweetId/likes/`

### Scenarios

1. **Invalid request (not following the user)**
    - **Status Code:** 401
    - **Body:** `Invalid Request`

2. **Valid request (following the user)**
    - **Status Code:** 200
    - **Body:** `{ "likes": ["username1", "username2", ...] }`

### Get Tweet Replies

### Endpoint
`GET /tweets/:tweetId/replies/`

### Scenarios

1. **Invalid request (not following the user)**
    - **Status Code:** 401
    - **Body:** `Invalid Request`

2. **Valid request (following the user)**
    - **Status Code:** 200
    - **Body:** `{ "replies": [ { "user": "username", "reply": "replyContent", "dateTime": "date-time" }, ... ] }`

### Create Tweet

### Endpoint
`POST /user/tweets/`

### Description
Create a tweet in the tweet table.

### Request
- **Body:** `{ "content": "tweetContent" }`

### Response
- **Status Code:** 201
- **Body:** `{ "tweetId": "newTweetId", "message": "Tweet created successfully" }`

### Delete Tweet

### Endpoint
`DELETE /tweets/:tweetId/`

### Scenarios

1. **Invalid request (deleting another user's tweet)**
    - **Status Code:** 401
    - **Body:** `Invalid Request`

2. **Valid request (deleting own tweet)**
    - **Status Code:** 200
    - **Body:** `Tweet Removed`

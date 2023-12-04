## Stack
  - Nestjs
  - TypeOrm
  - Postgres
  - Passportjs
  - Swagger

---
## Functional

  - authentication based on access and refresh tokens via httponly cookies
  - setup routes guard by default via access token
  - swagger documentation on **"/api"** route
---
## App flow 

1) **signup** 
    - hash password
    - generate pairs of access and refresh token 
    - hash new refresh token
    - save user data + refresh token to db
    - set tokens to cookie
    - return tokens pair in response body
2) **signin** 
    - compare hashed password from db to password from request
    - generate new pairs of access and refresh token 
    - hash new refresh token
    - update refresh token from db 
    - set tokens to cookie
    - return tokens pair in response body
3) **logout** 
    - validate cookie access token 
    - set refresh token in db to null
4) **password reset**
    - validate cookie access token 
    - hash new password
    - generate pairs of access and refresh token 
    - hash new refresh token
    - save user data + refresh token to db
    - set tokens to cookie
    - return tokens pair in response body
5) **refresh old refresh token**
    - validate cookie refresh token 
    - generate pairs of access and refresh token 
    - hash new refresh token
    - update refresh token from db
    - set tokens to cookie
    - return tokens pair in response body

---
## Installation

  - **clone repo**


  - **install dependencies**
```bash
$ npm ci
```

  - **create env file with next variables:**
    - BCRYPT_SALT = 10
    - AT_EXPIRES  
      - *access token lifetime by default set to 15 seconds for testing usage*
      - *refresh token set to 5 days*
    - AT_SECRET
    - RT_SECRET 
      - *secrets for tokens creation*

    #db usage 
    - DB_TYPE
    - DB_USER 
    - DB_PASS 
    - DB_PORT 
    - DB_NAME 
      - *for docker compose and typeOrm setup*
----
## Local running the app

```bash
# already exist docker-compose file 
docker-compose up -d

# development
$ npm run start

# watch mode
$ npm run start:dev

```





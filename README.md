## Dependencies

- npm install @prisma/client
- npm i prisma -D
- npm i -D class-validator class-transformer
- npm i argon2 --hash password--
- npm i @nestjs/passport passport passport-local ---login----
- npm i -D @types/passport-local
- nest g gu auth/guards/local-auth ---guards----
- npm i @nestjs/jwt @nestjs/config
- npm i passport-jwt
- npm i -D @types/passport-jwt
- npm i passport-google-oauth20
- npm i -D @types/passport-google-oauth20

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Auth Flow

1. ### Signup Flow

#### Client Sends a Signup Request:

- A POST request is made to the `/auth/signup` endpoint with the user’s email and password.

#### AuthController Handles the Request:

- The registerUser method in the AuthController receives the request.
- It extracts the data from the request body, validates it using the ValidationPipe, and forwards it to AuthService.registerUser().

#### AuthService Creates the User:

- The AuthService checks if a user with the same email exists by calling UserService.findByEmail().
- If no user exists, it creates the user using UserService.create().
- The new user is now registered.

#### Response:

- The user receives a success response confirming the registration.

2. ### Login Flow with Guard Protection

#### Client Sends a Login Request:

- The client sends a POST request to `/auth/login` with an email and password in the request body.

#### LocalAuthGuard is Triggered:

- The loginUser() method in AuthController is protected by the LocalAuthGuard.
- When the request hits `/auth/login`, LocalAuthGuard.canActivate() is executed first to validate the user before the controller handles the request.

#### canActivate() in LocalAuthGuard Validates the User:

- The guard extracts the email and password from the request.
- It calls AuthService.validateLocalUser() to validate the user’s credentials.

#### AuthService Validates the Credentials:

- In validateLocalUser(), the service:
  - Finds the user by email using UserService.findByEmail().
  - If found, it verifies the password using argon2.verify().
  - If credentials are valid, it returns the user’s ID and email.

#### Request Object is Updated by the Guard:

- If the user is valid, LocalAuthGuard attaches the user object to the request (via request.user = user).
- The request now contains the authenticated user’s data, and canActivate() returns true, allowing the request to proceed to the controller.

#### AuthController Handles the Login:

- Now that the guard has validated the user, the AuthController.loginUser() method is called.
- It receives the authenticated user from the request object.

#### AuthService Generates the JWT Token:

- Inside loginUser(), the AuthService.generateTokens() method creates a JWT token with the user’s ID (sub field).
- The response includes the JWT token, user ID, and email.

#### Response:

- The client receives a response with the user’s ID, email, and access token.

Client → Sends POST /auth/login (with email & password)
LocalAuthGuard → Triggers canActivate()
AuthService → validateLocalUser(email, password)
Verifies user’s existence and password.
LocalAuthGuard → Attaches user to request.user.
AuthController → Calls loginUser() method.
AuthService → Generates JWT token.
AuthController → Sends response (user ID, email, access token).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

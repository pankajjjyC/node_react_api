import session from 'express-session';

const sessionMiddleware = session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use secure: true if using HTTPS
});

export default sessionMiddleware;

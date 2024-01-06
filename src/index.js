import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';

import { redis } from 'configs/database';
import router from 'routes';

// CONSTANT
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// CONFIG
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// REDIS
redis.on('connect', function () {
  console.log('Redis client connected');
});
redis.on('error', function (err) {
  console.log('Something went wrong ' + err);
});

// ROUTER
app.use(router);

app.listen(port, () => {
  console.log(`Server start at http://localhost:${port}`);
});

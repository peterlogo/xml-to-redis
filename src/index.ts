import Redis from 'ioredis';
import fs from 'fs';
import dotEnv from 'dotenv';
import { parseString } from 'xml2js';
import { Cookie } from './types';

dotEnv.config();

const redis = new Redis(process.env.REDIS_URL || '');

// Uses Redis Set to store subdomains as a list of unique values
const processSubdomains = async (subdomains: string[]) => {
  const key = 'subdomains'; // get all subdomains
  await redis.sadd(key, subdomains); // add new subdomains
};

// Uses Redis Hash to store cookies as a key-value pair
const processCookies = async (cookie: Cookie[]) => {
  for (const c of cookie) {
    const key = `cookie:${c.$.name}:${c.$.host}`; // get all cookies for this host
    await redis.set(key, c._); // add new cookies
  }
};

const processFile = (file: string) => {
  fs.readFile(file, 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      parseString(data, async (err, result) => {
        if (err) {
          console.error(err);
        } else {
          const subdomains = result.config.subdomains[0].subdomain;
          await processSubdomains(subdomains);

          const cookies = result.config.cookies[0].cookie;
          await processCookies(cookies);
          console.log('Done');
        }
      });
    }
  });
};

processFile('src/config.xml');

redis.on('connect', () => {
  console.log('Redis connected');
});
redis.on('error', (err) => {
  console.error(err);
});

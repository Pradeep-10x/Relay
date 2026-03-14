import { redis } from "../lib/redis.js";

export const getCache = async (key : string) => {
    const cached = await redis.get(key);
    if(!cached) return null;
    return JSON.parse(cached);
}

export const setCache = async (key : string , value : any , ttl : 30) => {
    await redis.set(key , JSON.stringify(value) , "EX" , ttl);
}

export const deleteCache = async (key : string) => {
    await redis.del(key);
}
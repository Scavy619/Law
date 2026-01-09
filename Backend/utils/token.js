import jwt from "jsonwebtoken";
import {TokenSchema} from "../validations/tokenValidation.js";
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;


export async function createToken(payload){
    const validationResult = await TokenSchema.safeParseAsync(payload);

    if(validationResult.error) throw new Error(validationResult.error.message);

    const payloadValidatedData = validationResult.data;

    const token = jwt.sign(payloadValidatedData, JWT_SECRET, {expiresIn: '2d'});
    return token;
}

export function validateToken(token){
    try{
    const payload = jwt.verify(token, JWT_SECRET);
    return payload
    }catch(error){
        return null;
    }
}


export function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}


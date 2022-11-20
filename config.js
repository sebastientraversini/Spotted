import * as dotenv from "dotenv";
dotenv.config();

export const port = process.env.PORT || '3000';
export const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('Environnement variable $JWT_SECRET is required')
}


export default {
    port: process.env.PORT || 3000,
    db: {
        connection: process.env.DB_CONNECTION || 'mongodb://localhost:27017/spotted',
    },
    
};

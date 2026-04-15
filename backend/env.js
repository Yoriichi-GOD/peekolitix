import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
    path: path.join(__dirname, '.env')
});

if (process.env.NODE_ENV !== 'production') console.log("ENV LOADED:", process.env.SUPABASE_URL ? "Supabase configured" : "No Supabase");
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  pool.query("SELECT NOW()", (err, res) => {
    if (err) console.error("Ошибка подключения к БД", err);
    else console.log("База данных подключена:", res.rows);
  });
  
  export default pool;


import authRoutes from "./routes/authRoutes.js";
app.use("/auth", authRoutes);

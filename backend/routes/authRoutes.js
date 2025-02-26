import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pool from "../index.js"; // Подключаем базу
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Регистрация пользователя
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Некорректный email"),
    body("password").isLength({ min: 6 }).withMessage("Пароль слишком короткий"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Проверяем, есть ли пользователь
      const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "Email уже зарегистрирован" });
      }

      // Хэшируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаём пользователя
      const newUser = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hashedPassword]
      );

      // Генерируем токен
      const token = jwt.sign({ userId: newUser.rows[0].id }, "secret_key", { expiresIn: "1h" });

      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

// Вход пользователя
router.post(
    "/login",
    [
      body("email").isEmail().withMessage("Некорректный email"),
      body("password").exists().withMessage("Пароль обязателен"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        // Ищем пользователя в БД
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
        if (user.rows.length === 0) {
          return res.status(400).json({ message: "Неверный email или пароль" });
        }
  
        // Проверяем пароль
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
          return res.status(400).json({ message: "Неверный email или пароль" });
        }
  
        // Генерируем токен
        const token = jwt.sign({ userId: user.rows[0].id }, "secret_key", { expiresIn: "1h" });
  
        res.json({ token });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Ошибка сервера" });
      }
    }
  );
  
// Проверка авторизации
router.get("/me", authMiddleware, async (req, res) => {
    try {
      const user = await pool.query("SELECT id, email, created_at FROM users WHERE id = $1", [
        req.userId,
      ]);
      res.json(user.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });

export default router;

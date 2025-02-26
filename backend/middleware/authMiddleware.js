import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const token = req.header("Authorization");
  console.log("Полученный токен:", token); // Логируем токен

  if (!token) {
    return res.status(401).json({ message: "Нет доступа" });
  }

  try {
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ message: "Неверный формат токена" });
    }

    const decoded = jwt.verify(tokenParts[1], "secret_key");
    //console.log("Расшифрованный токен:", decoded); // Логируем содержимое токена

    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Ошибка верификации токена:", err);
    res.status(401).json({ message: "Неверный токен" });
  }
}

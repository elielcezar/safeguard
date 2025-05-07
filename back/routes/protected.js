import express from "express";
const router = express.Router();

// Rota protegida de exemplo
router.get("/test", (req, res) => {
  res.json({ message: "Rota protegida funcionando" });
});

export default router; 
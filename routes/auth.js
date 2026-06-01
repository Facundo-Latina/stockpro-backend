const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email.' });
    }

    const user = await User.create({ nombre, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ message: 'Usuario registrado exitosamente.', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario.', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (!user.activo) {
      return res.status(403).json({ message: 'Tu cuenta está suspendida. Contactá al administrador.' });
    }

    const passwordValida = await user.compararPassword(password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = generateToken(user._id);
    res.json({ message: 'Login exitoso.', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión.', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

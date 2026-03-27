const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/users - Todos los usuarios (solo admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios.', error: error.message });
  }
});

// PUT /api/users/:id - Editar usuario (solo admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { nombre, email, rol, activo } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, email, rol, activo },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json({ message: 'Usuario actualizado.', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario.', error: error.message });
  }
});

// PATCH /api/users/:id/toggle - Activar/suspender (solo admin)
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    user.activo = !user.activo;
    await user.save();

    res.json({ message: `Usuario ${user.activo ? 'activado' : 'suspendido'}.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado del usuario.', error: error.message });
  }
});

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json({ message: 'Usuario eliminado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario.', error: error.message });
  }
});

module.exports = router;

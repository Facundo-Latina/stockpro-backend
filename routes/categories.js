const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/categories
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find({ activo: true }).sort({ nombre: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías.', error: error.message });
  }
});

// POST /api/categories (solo admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'El nombre es requerido.' });

    const existing = await Category.findOne({ nombre: { $regex: `^${nombre}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Ya existe una categoría con ese nombre.' });

    const category = await Category.create({ nombre, descripcion });
    res.status(201).json({ message: 'Categoría creada.', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría.', error: error.message });
  }
});

// PUT /api/categories/:id (solo admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada.' });
    res.json({ message: 'Categoría actualizada.', category });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría.', error: error.message });
  }
});

// DELETE /api/categories/:id (solo admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada.' });
    res.json({ message: 'Categoría eliminada.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría.', error: error.message });
  }
});

module.exports = router;

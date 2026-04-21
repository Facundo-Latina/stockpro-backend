const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { validateProduct, validateStockUpdate, validateMongoId } = require('../middleware/validate');

// GET /api/products
router.get('/', protect, async (req, res) => {
  try {
    const { categoria, busqueda, soloActivos } = req.query;
    let filter = {};

    if (soloActivos !== 'false') filter.activo = true;
    if (categoria) filter.categoria = categoria;
    if (busqueda) filter.nombre = { $regex: busqueda, $options: 'i' };

    const products = await Product.find(filter)
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 });

    res.json({ products, total: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos.', error: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', protect, validateMongoId, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoria', 'nombre');
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto.', error: error.message });
  }
});

// POST /api/products
router.post('/', protect, adminOnly, validateProduct, async (req, res) => {
  try {
    const { nombre, descripcion, stock, precio, categoria, stockMinimo } = req.body;

    const product = await Product.create({
      nombre,
      descripcion,
      stock,
      precio,
      categoria: categoria || null,
      stockMinimo: stockMinimo || 5,
      fechaUltimoControlStock: new Date(),
    });

    const populated = await product.populate('categoria', 'nombre');
    res.status(201).json({ message: 'Producto creado exitosamente.', product: populated });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto.', error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', protect, adminOnly, validateMongoId, validateProduct, async (req, res) => {
  try {
    const { nombre, descripcion, stock, precio, categoria, stockMinimo } = req.body;
    const updateData = { nombre, descripcion, stock, precio, stockMinimo };
    if (categoria !== undefined) updateData.categoria = categoria || null;
    if (stock !== undefined) updateData.fechaUltimoControlStock = new Date();

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('categoria', 'nombre');

    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ message: 'Producto actualizado.', product });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto.', error: error.message });
  }
});

// PATCH /api/products/:id/stock
router.patch('/:id/stock', protect, validateMongoId, validateStockUpdate, async (req, res) => {
  try {
    const { stock, operacion } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });

    let nuevoStock = product.stock;
    if (operacion === 'add') nuevoStock += Number(stock);
    else if (operacion === 'subtract') nuevoStock -= Number(stock);
    else nuevoStock = Number(stock);

    if (nuevoStock < 0) {
      return res.status(400).json({ message: 'El stock no puede quedar en negativo.' });
    }

    product.stock = nuevoStock;
    product.fechaUltimoControlStock = new Date();
    await product.save();

    const populated = await product.populate('categoria', 'nombre');
    res.json({ message: 'Stock actualizado.', product: populated });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar stock.', error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, validateMongoId, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Producto no encontrado.' });
    res.json({ message: 'Producto eliminado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto.', error: error.message });
  }
});

module.exports = router;

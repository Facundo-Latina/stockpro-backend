const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
  },
  descripcion: {
    type: String,
    trim: true,
    default: '',
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0,
  },
  precio: {
    type: Number,
    min: [0, 'El precio no puede ser negativo'],
    default: 0,
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  fechaUltimoControlStock: {
    type: Date,
    default: Date.now,
  },
  stockMinimo: {
    type: Number,
    default: 5,
    min: 0,
  },
  activo: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

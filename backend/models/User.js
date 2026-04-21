const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: 6,
    select: false,
  },
  rol: {
    type: String,
    enum: ['admin', 'usuario'],
    default: 'usuario',
  },
  activo: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  // Solo hashear si la contraseña fue modificada Y no es ya un hash de bcrypt
  if (!this.isModified('password')) return next();
  if (this.password.startsWith('$2b$')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

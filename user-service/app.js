const express = require("express");
const cors = require("cors");
const { DataTypes } = require("sequelize");
const sequelize = require("./database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_123";

// 1. Model User
// REVISI BAGIAN MODEL
const User = sequelize.define(
  "User",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: "customer" },
  },
  {
    // PINDAHKAN KE SINI
    freezeTableName: true,
    tableName: "users", // Paksa nama tabel jadi 'users' (huruf kecil)
  }
);

// Sinkronisasi Database
(async () => {
  try {
    // Gunakan { force: true } sekali saja untuk memastikan tabel dibuat
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
})();

// --- Helper Response ---
const success = (res, message, data = null) =>
  res.status(200).json({ success: true, message, data });
const errorResponse = (res, status, message) =>
  res.status(status).json({ success: false, message });

// --- MIDDLEWARE AUTHENTICATION ---
// Digunakan untuk mengecek apakah user sudah login (punya token)
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Ambil token dari "Bearer <token>"

  if (!token) return errorResponse(res, 401, "Access denied, token missing");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Menyimpan data user (id, role) ke request
    next();
  } catch (err) {
    errorResponse(res, 403, "Invalid or expired token");
  }
};

// --- MIDDLEWARE ADMIN ONLY ---
// Digunakan jika route hanya boleh diakses oleh admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return errorResponse(res, 403, "Access denied, admin only");
  }
  next();
};

// --- ROUTES ---

// 1. PUBLIC: Register
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const userOutput = user.toJSON();
    delete userOutput.password; // Jangan tampilkan password di response
    success(res, "User registered", userOutput);
  } catch (err) {
    errorResponse(res, 400, err.message);
  }
});

// 2. PUBLIC: Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    success(res, "Login successful", {
      token,
      role: user.role,
      id: user.id, // Harus 'id'
      name: user.name, // Harus 'name'
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
});

// 3. PROTECTED: Get Profile Saya (User yang sedang login)
app.get("/users/me", authenticate, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
  });
  success(res, "Profile retrieved", user);
});

// 4. ADMIN ONLY: Get All Users
app.get("/users", authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    success(res, "All users retrieved", users);
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
});

// 5. PROTECTED: Update User (Hanya bisa update diri sendiri atau oleh admin)
app.put("/users/:id", authenticate, async (req, res) => {
  try {
    // Cek apakah yang update adalah pemilik ID tersebut atau dia adalah Admin
    if (req.user.id != req.params.id && req.user.role !== "admin") {
      return errorResponse(res, 403, "You can only update your own profile");
    }

    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");

    user.name = name || user.name;
    user.email = email || user.email;
    if (req.user.role === "admin") user.role = role || user.role; // Hanya admin yang bisa ubah role

    await user.save();
    success(res, "User updated successfully", {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
});

// 6. ADMIN ONLY: Delete User
app.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found");

    await user.destroy();
    success(res, "User deleted successfully");
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));

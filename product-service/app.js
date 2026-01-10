const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // Mengambil koneksi dari database.js

const app = express();
app.use(cors());
app.use(express.json());

// 1. Definisikan model Produk
const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    description: { type: DataTypes.TEXT }
}, {
    tableName: 'products',
    freezeTableName: true
});

// 2. Sinkronisasi model
(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Product table created/updated!');     
    } catch (error) {
        console.error('Unable to sync Product table:', error);
    }
})();

// --- Helper Response ---
const success = (res, message, data = null) => res.status(200).json({ message, data });
const errorRes = (res, status, message) => res.status(status).json({ success: false, message });

// --- ROUTES ---
app.get('/products', async (req, res) => {
    try {
        const data = await Product.findAll();
        success(res, 'Products retrieved successfully', data);
    } catch (err) {
        errorRes(res, 500, err.message);
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return errorRes(res, 404, 'Product not found');
        success(res, 'Product retrieved successfully', product);
    } catch (err) {
        errorRes(res, 500, err.message);
    }
});

app.post('/products', async (req, res) => {
    try {
        const { name, price, description } = req.body;
        if (!name || !price) return errorRes(res, 400, 'Name and Price are required');
        const product = await Product.create({ name, price, description });
        success(res, 'Product created successfully', product);
    } catch (err) {
        errorRes(res, 500, err.message);
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return errorRes(res, 404, 'Product not found');
        await product.update(req.body);
        success(res, 'Product updated successfully', product);
    } catch (err) {
        errorRes(res, 500, err.message);
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return errorRes(res, 404, 'Product not found');
        await product.destroy();
        success(res, 'Product deleted successfully');
    } catch (err) {
        errorRes(res, 500, err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
});
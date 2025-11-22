const express = require('express');
const app = express();

//dummy data producyts
const products = [
    { id: 1, name: 'Laptop', price: 999,Description:"this is a laptop" },
    { id: 2, name: 'Smartphone', price: 499, Description:"this is a smartphone" },
    { id: 3, name: 'Tablet', price: 299, Description:"this is a tablet" },
];

//endpoint to get all products
app.get('/products', (req, res) => {
    res.json(products);
});

//endpoint to get a product by id
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

//menjalankan server pada port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Product service is running on port ${PORT}`);
}
);

//cara kedua
//app.listen(3000, () => {
//    console.log('Product service is running on port 3000');
//});

//latihan 30 meni
// implementasi ke flutter agar data bisa di akses dari product service ini dan detailnya
// tampilan di flutter nya bisa menampung product dan cart
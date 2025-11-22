const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
//dummy data producyts
const users = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
];

//endpoint to get all users
app.get('/users', (req, res) => {
    res.json(users);
});

//endpoint to get a user by id
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(p => p.id === userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'user not found' });
    }
});

app.post('/users', (req, res) => {
    const { name, email, role } = req.body;

    // Validasi field wajib
    if (!name || !email || !role) {
        return res.status(400).json({
            message: "name, email, and role are required"
        });
    }

    // Buat ID baru
    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

    const newUser = {
        id: newId,
        name,
        email,
        role
    };

    users.push(newUser);

    res.status(201).json({
        message: "User created successfully",
        user: newUser
    });
});

//menjalankan server pada port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`user service is running on port ${PORT}`);
}
);

//cara kedua
//app.listen(4000, () => {
//    console.log('user service is running on port 4000');
//});

//latihan 30 meni
// implementasi ke flutter agar data bisa di akses dari user service ini dan detailnya
// tampilan di flutter nya bisa menampung user dan cart
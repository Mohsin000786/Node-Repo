const userDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const fsPromise = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'username and password are required' });

    const duplicate = await userDB.users.find(person => person.username === user);
    if (duplicate) return res.sendStatus(400);

    try {
        const hashedpwd = await bcrypt.hash(pwd, 10);
        const newUser = {
            "username": user,
            "roles": { "User": 2001},
            "pwd": hashedpwd
        };

        userDB.setUsers([...userDB.users, newUser]);
        await fsPromise.writeFile(path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(userDB.users))
        console.log(userDB.users);
        res.status(201).json({ 'message': `New user ${user} created!` })
    } catch (error) {
        res.status(500).json({ 'message': error.message })
    }
}

module.exports = { handleNewUser };
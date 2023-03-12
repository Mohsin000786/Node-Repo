const userDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises = require('fs').promises;
const path = require('path');


const handleLogin = async (req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'username and password are required' });

    const existedUser = userDB.users.find(person => person.username === user);
    if (!existedUser) return res.sendStatus(401);

    const match = await bcrypt.compare(pwd, existedUser.pwd);
    if (match) {
        const roles = Object.values(existedUser.roles);


        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": existedUser.username,
                    "roles": roles
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30s' }
        );
        const refreshToken = jwt.sign(
            { "username": existedUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        )

        const otherUsers = userDB.users.filter(person => person.username !== existedUser.username);
        const currentUser = { ...existedUser, refreshToken };
        userDB.setUsers([...otherUsers, currentUser])
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(userDB.users)
        )
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken })
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin } 
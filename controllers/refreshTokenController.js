const userDB = {
    users: require('../model/users.json'),
    setUsers : function(data) {this.users = data}
}

const jwt = require('jsonwebtoken');
require('dotenv').config();


const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;
    if(!cookies.jwt) return res.sendStatus(401);
    console.log("Cookies", cookies.jwt)
    const refreshToken = cookies.jwt;

    const existedUser = userDB.users.find(person => person.refreshToken === refreshToken);
    if(!existedUser) {
        return res.sendStatus(403);
    }

    jwt.verify(
        refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) =>{
            if(err || existedUser.username !== decoded.username) {
                return res.sendStatus(403)
            }
            const roles = Object.values(existedUser.roles)
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn : '30s'}
            );
            res.json({accessToken});
        }
    )
}

module.exports = { handleRefreshToken } 
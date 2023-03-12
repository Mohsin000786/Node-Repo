const userDB = {
    users: require('../model/users.json'),
    setUsers : function(data) {this.users = data}
}
const fsPromise = require('fs').promises;
const path = require('path');


const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if(!cookies.jwt) return res.sendStatus(204); // No Content
    const refreshToken = cookies.jwt;

    const existedUser = userDB.users.find(person => person.refreshToken === refreshToken);
    if(!existedUser) { 
        res.clearCookie('jwt',  {httpOnly: true, sameSite: 'None' , secure: true})
        return res.sendStatus(403); //Foridden
    }

    const otherUsers = userDB.users.filter(person => person.refreshToken !== existedUser.refreshToken);
    const currentUser = {...existedUser, refreshToken: ''};
    userDB.setUsers([...otherUsers, currentUser])

    await fsPromise.writeFile(path.join(__dirname, '..', 'model', 'users.json'), JSON.stringify(userDB.users))

    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None' , secure: true})
    res.sendStatus(204)
}

module.exports = { handleLogout } 
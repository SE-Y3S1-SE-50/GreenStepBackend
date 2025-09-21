const User = require("./users.mongo");

const CreateUser = async (user) => {
    try {
        const user1 = await User.create({
            username: user.username,
            password: user.password,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
        })

        return user1._id
    } catch (error) {
        console.log("error", error)
    }} 


module.exports = {
    CreateUser
}
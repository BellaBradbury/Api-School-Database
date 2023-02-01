'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const models = require('./models');
const { User } = models;

exports.authenticateUser = async (req, res, next) => {
    let message;

    // parse the user's credentials
    const credentials = auth(req);

    if(credentials) {
        // checks to see if a username matches and retrieves it
        const user = await User.findOne({ where: {emailAddress: credentials.name }});
        
        if(user) {
            // compares the given password with the known password
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
                if(authenticated) {
                    console.log('Sussful login attempt');

                    // stores the user
                    req.currentUser = user;
                } else {
                    message = "Incorrect password";
                }
        } else {
            message = "Account not found";
        }
    } else {
        message = "No method of authentication found"
    }

    if(message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
}
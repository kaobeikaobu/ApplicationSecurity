const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Member = require("../Database/member");
const AuthLog = require("../Database/AuthLog");

const validateName = async (name) => {
    const member = await Member.findOne({ name });
    return !member;
};

const validateEmail = async (email) => {
    const member = await Member.findOne({ email });
    return !member;
};


const logAuthEvent = async ({ req, name, email, role, event, status, reason }) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';

    await AuthLog.create({
        name,
        email,
        role,
        event,
        status,
        reason,
        ip,
        userAgent
    });
};


const memberSignup = async (req, role, res) => {
    try {
        const { name, email, password } = req.body;

        let nameNotTaken = await validateName(name);
        if (!nameNotTaken) {
            await logAuthEvent({
                req,
                name,
                email,
                role,
                event: 'register',
                status: 'failure',
                reason: 'Name already taken'
            });

            return res.status(400).json({ message: "Name already taken." });
        }

        let emailNotRegistered = await validateEmail(email);
        if (!emailNotRegistered) {
            await logAuthEvent({
                req,
                name,
                email,
                role,
                event: 'register',
                status: 'failure',
                reason: 'Email already registered'
            });

            return res.status(400).json({ message: "Email already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newMember = new Member({
            ...req.body,
            password: hashedPassword,
            role
        });

        await newMember.save();

        await logAuthEvent({
            req,
            name,
            email,
            role,
            event: 'register',
            status: 'success',
            reason: 'Registration successful'
        });

        return res.status(201).json({ message: "Member registered successfully." });

    } catch (err) {
        const { name, email } = req.body;

        await logAuthEvent({
            req,
            name,
            email,
            role,
            event: 'register',
            status: 'failure',
            reason: err.message
        });

        return res.status(500).json({ message: `${err.message}` });
    }
};


/** 
 * To login the member (Member, president)
*/

const memberLogin = async (req, role, res) => {
    const { name, password } = req.body;  // read from req.body

    const member = await Member.findOne({ name });

    if (!member) {
        await logAuthEvent({
            req,
            name,
            role,
            event: 'login',
            status: 'failure',
            reason: 'User not found'
        });
        return res.status(400).json({ message: "Member is not found. Invalid login credentials." });
    }

    if (member.role != role) {
        await logAuthEvent({
            req,
            name,
            email: member.email,
            role,
            event: 'login',
            status: 'failure',
            reason: 'Wrong role'
        });
        return res.status(400).json({ message: "Please ensure you are logging in from the right role." });
    }

    const now = new Date();
    const MAX_ATTEMPTS = 3;
    const LOCK_DURATION = 15 * 60 * 1000;

    if (member.lockUntil && member.lockUntil > now) {
        const minutesLeft = Math.ceil((member.lockUntil - now) / 60000);
        await logAuthEvent({ req, name, email: member.email, role, event: 'login', status: 'failure', reason: `Account locked. Try again in ${minutesLeft} minute(s).` });
        return res.status(403).json({ message: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    const isMatch = await bcrypt.compare(password, member.password);
    if (isMatch) {
        member.failedLoginAttempts = 0;
        member.lockUntil = null;
        await member.save();

        const token = jwt.sign(
            {
                role: member.role,
                name: member.name,
                email: member.email
            },
            process.env.APP_SECRET,
            { expiresIn: "3 days" }
        );

        await logAuthEvent({
            req,
            name: member.name,
            email: member.email,
            role,
            event: 'login',
            status: 'success',
            reason: 'Login successful'
        });

        return res.status(200).json({
            name: member.name,
            role: member.role,
            email: member.email,
            token,
            expiresIn: 168,
            message: "Login successful."
        });
    } else {
        member.failedLoginAttempts += 1;
        if (member.failedLoginAttempts >= MAX_ATTEMPTS) {
            member.lockUntil = new Date(now.getTime() + LOCK_DURATION);
        }
        await member.save();

        const remainingAttempts = MAX_ATTEMPTS - member.failedLoginAttempts;

        await logAuthEvent({
            req,
            name,
            email: member.email,
            role,
            event: 'login',
            status: 'failure',
            reason: 'Wrong password'
        });

        return res.status(400).json({
            message: member.lockUntil
                ? `Too many failed attempts. Account locked for ${Math.ceil((member.lockUntil - now) / 60000)} minutes.`
                : `Incorrect password. ${remainingAttempts} attempt(s) remaining.`
        });
    }
};


const memberAuth = (req, res, next) => {
    console.log(req.headers)
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    if (!authHeader) return res.status(403).json({ message: "Missing token." });
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.APP_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({
                message: "Wrong token."
            });
            console.log(decoded.name);
            req.name = decoded.name;
            next();
        },
    );
}

const checkRole = roles => async (req, res, next) => {
    let { name } = req;
    const member = await Member.findOne({ name });
    !roles.includes(member.role)
        ? res.status(403).json(
            "Sorry, you do not have access to this route.")
        : next();
}



module.exports = {
    memberSignup,
    memberLogin,
    checkRole,
    memberAuth
};

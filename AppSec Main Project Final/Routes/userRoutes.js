const router = require("express").Router();
const {

    memberSignup, memberLogin, memberAuth, checkRole

} = require("../Controller/authFunctions");

const verifyRecaptcha = require('../verifyRecaptcha');

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000;

// Member Registration Route
router.post("/register-member", async (req, res) => {
    try {
        const { recaptchaToken } = req.body;

        // Validate reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return res.status(400).json({ message: "reCAPTCHA verification failed." });
        }

        // Proceed with member registration
        await memberSignup(req, "member", res);
    } catch (err) {
        console.error("Error during member registration:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// President Registration Route
router.post("/register-president", async (req, res) => {

    try {
        const { recaptchaToken } = req.body;

        // Validate reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return res.status(400).json({ message: "reCAPTCHA verification failed." });
        }

        // Proceed with member registration
        await memberSignup(req, "president", res);
    } catch (err) {
        console.error("Error during member registration:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Secretary Registration Route
router.post("/register-secretary", async (req, res) => {
    try {
        const { recaptchaToken } = req.body;

        // Validate reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return res.status(400).json({ message: "reCAPTCHA verification failed." });
        }

        // Proceed with member registration
        await memberSignup(req, "secretary", res);
    } catch (err) {
        console.error("Error during member registration:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }

});

// Admin Registration Route 
router.post("/register-admin", async (req, res) => {
    try {
        const { recaptchaToken } = req.body;

        // Validate reCAPTCHA
        const isHuman = await verifyRecaptcha(recaptchaToken);
        if (!isHuman) {
            return res.status(400).json({ message: "reCAPTCHA verification failed." });
        }

        // Proceed with member registration
        await memberSignup(req, "admin", res);
    } catch (err) {
        console.error("Error during member registration:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }

});

// Member Login Route
router.post("/login-member", async (req, res) => {
    await memberLogin(req, "member", res);
});

// President Login Route
router.post("/login-president", async (req, res) => {
    await memberLogin(req, "president", res);
});

// Secretary Login Route
router.post("/login-secretary", async (req, res) => {
    await memberLogin(req, "secretary", res);
});

// Admin Login Route
router.post("/login-admin", async (req, res) => {
    await memberLogin(req, "admin", res);
});

// Public unprotected route
router.get("/public", (req, res) => {
    return res.status(200).json("Public Domain");
});

// Member protected route
router.get("/member-protected", memberAuth, checkRole(["member"]), async (req, res) => {
    return res.status(200).json(`Welcome ${req.name}`);
});

// President protected route
router.get("/president-protected", memberAuth, checkRole(["president"]), async (req, res) => {
    return res.status(200).json(`Welcome ${req.name}`);
});

// Secretary protected route
router.get("/secretary-protected", memberAuth, checkRole(["secretary"]), async (req, res) => {
    return res.status(200).json(`Welcome ${req.name}`)
});

// Admin protected route
router.get("/admin-protected", memberAuth, checkRole(["admin"]), async (req, res) => {
    return res.status(200).json(`Welcome ${req.name}`);
});

// Admin logs route
const AuthLog = require("../Database/AuthLog");
router.get("/admin/logs", memberAuth, checkRole(["admin"]), async (req, res) => {
    try {
        const logs = await AuthLog.find().sort({ timestamp: -1 }).limit(100);
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve logs" });
    }
});


module.exports = router;
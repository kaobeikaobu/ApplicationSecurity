// verifyRecaptcha.js
const RECAPTCHA_SECRET = "6LdZM5UrAAAAAGfKiPBvHzx8xsEWvgo1Iow2kZgg";

async function verifyRecaptcha(token) {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            secret: RECAPTCHA_SECRET,
            response: token,
        }),
    });

    const data = await res.json();
    return data.success;
}

module.exports = verifyRecaptcha;

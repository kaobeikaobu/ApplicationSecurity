// Importing Schema and model from mongoose module
const { Schema, model } = require('mongoose');

// Defining the schema for Member
const MemberSchema = new Schema(
    {
        // Name field of the member
        name: {
            type: String,   // Data type is String
            required: true  // This field is required
        },
        // Email field of the member
        email: {
            type: String,   // Data type is String
            required: true, // This field is required
        },

        // Role field of the member
        role: {
            type: String,   // Data type is String
            enum: ['president', 'secretary', 'member', 'admin'],
            required: true // The value of this field must be one of the specified values
        },

        // Password field of the member
        password: {
            type: String, // Data type is String
            required: true // This field is required
        },
        failedLoginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date,
            default: null
        }
    },
    { timestamps: true } // Enable timestamps
);

// Exporting the Member model 
module.exports = model('Member', MemberSchema); // The model is named 'Member' and uses the MemberSchema schema

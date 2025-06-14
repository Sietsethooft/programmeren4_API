const joi = require('joi');

const validation = {
    registerUserValidation: (data) => {
        const schema = joi.object({
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            street: joi.string().required(),
            city: joi.string().required(),
            emailAdress: joi.string().pattern(new RegExp('^[a-z]{1}\\.[a-z]{2,}@[a-z]{2,}\\.[a-z]{2,3}$')).required(),
            password: joi.string().min(8).pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d).*$')).required(),
            phonenumber: joi.string().pattern(new RegExp('^06[\\s-]?\\d{8}$')).required()
        });

        return schema.validate(data);
    },

    updateUserValidation: (data) => {
        const schema = joi.object({
            firstName: joi.string(),
            lastName: joi.string(),
            street: joi.string(),
            city: joi.string(),
            isActive: joi.number().valid(0, 1),
            emailAdress: joi.string().pattern(new RegExp('^[a-z]{1}\\.[a-z]{2,}@[a-z]{2,}\\.[a-z]{2,3}$')).required(),
            password: joi.string().min(8).pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d).*$')),
            phonenumber: joi.string().pattern(new RegExp('^06[\\s-]?\\d{8}$'))
        });

        return schema.validate(data);
    },

    createMealValidation: (data) => {
        const schema = joi.object({
            name: joi.string().required(),
            description: joi.string().required(),
            price: joi.number().required(),
            dateTime: joi.date().iso().required(),
            maxAmountOfParticipants: joi.number().integer().min(1).required(),
            imageUrl: joi.string().required(),
        });

        return schema.validate(data);
    },

    updateMealValidation: (data) => {
        const schema = joi.object({
            name: joi.string().required(),
            price: joi.number().required(),
            maxAmountOfParticipants: joi.number().integer().min(1).required(),
            description: joi.string(),
            dateTime: joi.date().iso(),
            imageUrl: joi.string(),
            isVegan: joi.number(),
            isVega: joi.number(),
            isToTakeHome: joi.number(),
            isActive: joi.number(),
            allergenes: joi.array().items(joi.string()),
        });

        return schema.validate(data);
    }
}

module.exports = validation;
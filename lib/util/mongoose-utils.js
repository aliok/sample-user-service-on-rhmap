var mongoose = require('mongoose');

/**
 * Provides helper function(s) to be used while working with Mongoose.
 *
 * @module lib/util/mongoose-utils
 */
module.exports = {

    /**
     * Mongoose returns an error in case of a failed operation. For us,
     * it is important what kind of failure it is. For example, if it is
     * a validation error, we tell that to client. If not, we don't tell
     * the internals of the error to client.
     * @param {Error} err - error to inspect.
     * @return {boolean} - true if given error is a validation error.
     */
    isValidationError: function (err) {
        return err && (isMongooseValidationError(err) || isMongoValidationError(err));
    }

};

function isMongooseValidationError(err) {
    return err instanceof mongoose.Error &&
        (
            // this is the error returned when a property is tried to be persisted
            // and which is not in the schema
            err.name === 'StrictModeError' ||

            // Mongoose validation errors
            err instanceof mongoose.Error.ValidationError ||

            // Mongoose validation errors caused by type casting
            err instanceof mongoose.Error.CastError
        );
}

function isMongoValidationError(err) {
    // this is the error returned when e.g. a unique index fails
    return err.name === "MongoError" && err.code === 11000;
}

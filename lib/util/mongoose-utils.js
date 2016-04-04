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
    isMongooseValidationError: function (err) {
        return err && err instanceof mongoose.Error &&
            (
                err.name === 'StrictModeError' ||
                err instanceof mongoose.Error.ValidationError ||
                err instanceof mongoose.Error.CastError
            );
    }

};

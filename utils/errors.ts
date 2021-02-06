const HeartErrors = {

    invalidAccount: {
        "error": "account id invalid"
    },

    duplicateUser: {
        "error": "user already exists"
    },

    userNotAllowed: {
        "error": "username is not allowed"
    },

    auth: {
        "error": "username or password incorrect"
    },

    notImplemented: {
        "error": "Not implemented"
    },

    missingParam: {
        "error": "missing required parameter"
    },

    databaseError: {
        "error": "could not query database"
    }

}

export default HeartErrors;

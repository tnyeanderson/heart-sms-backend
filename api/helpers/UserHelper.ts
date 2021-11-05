class UserHelper {
    allowed: string[] = [];
    allowAll = false;

    /**
     * Initialize the UserHelper values
     */
    constructor () {
        // The comma delimited string of allowed users from the environment variable
        const allowedStr = process.env.HEART_ALLOWED_USERS || null;

        if (allowedStr === null) {
            console.log("HEART_ALLOWED_USERS is not set. Signups will not be permitted.");
        } else if (allowedStr === '*') {
            console.log("Allowing all user signups.");
            this.allowAll = true;
        } else {
            // Set this.allowed to an array of the allowed users
            this.allowed = allowedStr.split(',');
        }
    }

    /**
     * Determine whether a given username is allowed to sign up
     * @param username
     */
    isAllowed (username: string) {
        // All signups are allowed, always return true
        if (this.allowAll) return true;

        // If the user is in the allowed array, return true
        // Otherwise, user is not allowed
        return (this.allowed.includes(username));
    }
}

const userHelper = new UserHelper();

export default userHelper;
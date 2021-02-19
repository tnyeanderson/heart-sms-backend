class UserHelper {
    allowed: string[] = [];
    allowAll = false;

    constructor () {
        let allowedStr = process.env.HEART_ALLOWED_USERS || null;

        if (allowedStr === null) {
            console.log("HEART_ALLOWED_USERS is not set. Signups will not be permitted.");
        } else if (allowedStr === '*') {
            console.log("Allowing all user signups.");
            this.allowAll = true;
        } else {
            this.allowed = allowedStr.split(',');
        }
    }

    isAllowed (username: string) {
        if (this.allowAll) return true;

        if (this.allowed.indexOf(username) > -1) return true;
        
        return false;
    }
}

const userHelper = new UserHelper();

export default userHelper;
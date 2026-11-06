import "server-only";

// Hard-coded admin login (no database).
// Only a bcrypt hash of the password is stored here, so the real password
// isn't readable from the source code.
//
// To change the password, generate a new hash and paste it below:
//   node -e "console.log(require('bcryptjs').hashSync('YOUR-NEW-PASSWORD', 12))"
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD_HASH = "$2b$12$UR31nMZkuw8Nu2/ypZIxAOAHSEv4ae08rDSZld/2QnUOdNbuEgQvG";
export const ADMIN_DISPLAY_NAME = "Skylantic Admin";

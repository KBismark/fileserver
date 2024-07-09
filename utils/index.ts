
export const JWT_SECRET = process.env.JWT_SECRET;


// Returns 6-character random number 
export const getVerificationCode = ()=>`${Math.random()}`.slice(2,8)


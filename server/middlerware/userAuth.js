import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.json({ success: false, message: 'Not authorized. login again' })
    }

    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(tokenDecode.id){
            req.userId = tokenDecode.id
        }
        else{
            return res.json({success:false,message:"Not authorized. login again"})
        }
        next();
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export default userAuth;
export const signupController=(req,res)=>{
        res.status(200).json({
            msg:"api hit successfully"
        })
};

export const loginController=(req,res)=>{
    res.status(200).json({
        msg:"login api hit successfully"
    })
}

export const logoutController=(req,res)=>{
    res.status(200).json({
        msg:"logout api hit successfully"
    })
}
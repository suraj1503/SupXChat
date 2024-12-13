const corsOption = {
    origin:["http://localhost:5173","http://localhost:4173","http://localhost:5174",process.env.CLIENT_URL],
    credentials:true ,   // with this we can send headers
    methods:["GET","POST","PUT","DELETE"]
}

const SUPX_TOKEN = "supx_token"
const SUPX_ADMIN_TOKEN = "supx_admin_token"

export {corsOption, SUPX_TOKEN,SUPX_ADMIN_TOKEN}
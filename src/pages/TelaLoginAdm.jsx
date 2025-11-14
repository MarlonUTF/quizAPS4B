import "./TelaLoginAdm.css"
import Logo from "../../public/logo.png"
export default function TelaLoginAdm(){
    return(
        <div  style={{ width: "100vw",height: "100vh",backgroundColor:"#171738"}}>
            <img src={Logo} alt="" width={100}/>
            <div className="telaLoginAdm" style={{display:"flex",flexDirection:"column",justifyContent:"center", alignItems:"center"}} >
                <h1>Login</h1>
                <div style={{display:"flex",flexDirection:"column",backgroundColor:"white",padding:"20px",borderRadius:"10px",gap:"2px"}} > 
                    <p>Email</p>
                    <input type="text" />
                    <p>Senha</p>
                    <input type="number" />
                    <button style={{backgroundColor:"#06A48A", color:"white",alignSelf:"center",padding:"10px",marginTop:"10px",borderRadius:"8px", width:"230px"}}>Entrar</button>
                    <div style={{marginTop:"20px",display:"flex",flexDirection:"column"}}>
                        <a href="">Esqueceu sua senha?</a>
                        <a href="/criarconta">Criar conta</a>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
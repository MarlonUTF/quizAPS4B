import Logo from "../../public/logo.png"
export default function CriarConta(){
    return(
        <div style={{ width: "100vw",height: "100vh",backgroundColor:"#171738"}}>
            <img src={Logo} alt="" width={100}/>
            <div className="criarConta" style={{display:"flex",flexDirection:"column",justifyContent:"center", alignItems:"center"}} >
                <h1>Criar conta</h1>
                <div style={{display:"flex",flexDirection:"column",backgroundColor:"white",padding:"20px",borderRadius:"10px",gap:"2px"}} > 
                    <p>Nome</p>
                    <input type="text" />
                    <p>Sobrenome</p>
                    <input type="text" />
                    <p>Email</p>
                    <input type="text" />
                    <p>Senha</p>
                    <input type="number" />
                    <button style={{backgroundColor:"#06A48A", color:"white",alignSelf:"center",padding:"10px",marginTop:"10px",borderRadius:"8px", width:"230px"}}>Criar</button>
                </div>
            </div>
        </div>
    )
}
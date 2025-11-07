import Logo from "../../public/logo.png"
import ImgPlus from "../../public/adicionar.png"
export default function Home(){
    return(
        <div>
            <header style={{backgroundColor:"gray", width:"100vw",height:"6vh"}}></header>
            <div style={{ display:"flex",flexDirection:"column",justifyContent:"center", alignItems:"center", width:"100vw", height:"100vh", gap:"20px"}}>
            
            <img src={Logo} alt="" height={10} width={100}/>
             <h1>Olá usuário!</h1>
            <div style={{ display: "flex" , gap:"10px"}}>
                <div style={{display:"flex", flexDirection:"column",alignItems:"center", gap:"10px"}}>
                    <button style={{ border: "3px solid black" , width:"20vw", height:"40vh", borderRadius:"10px", display:"flex", alignItems:"center",justifyContent:"center"}}> <img src={ImgPlus} alt="" width={40} height={40}/></button>
                    <p>Criar nova Sala</p>
                </div>
                <div style={{display:"flex", flexDirection:"column",alignItems:"center", gap:"10px"}}>
                <button style={{ backgroundColor: "#08D1B0", width:"20vw", height:"40vh", borderRadius:"10px",boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)"}}> </button>
                    <p>Criar nova Sala</p>
                </div>
                <div style={{display:"flex", flexDirection:"column",alignItems:"center", gap:"10px"}}>
                <button style={{ backgroundColor: "#593C90", width:"20vw", height:"40vh", borderRadius:"10px",boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)"}}> </button>
                    <p>Criar nova Sala</p>
                </div>
               
            </div>
        </div>
        </div>
        
    )
}
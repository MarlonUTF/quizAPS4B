import BemVindo from "../../public/bemvindo.png"
import "./TelaInicial.css"
export default function TelaInicial(){
    return(
        <div className="background " style={{width:"100vw", height:"100vh",backgroundColor:"#171738", display:"flex",flexDirection:"column",alignItems:"center", justifyContent:"center", gap:"10px"}}>
            <img src={BemVindo} alt="" width={400} />
            <div style={{display:"flex",gap:"10px"}}>
                <button style={{background:"#77BAB7", padding:"10px 25px ", borderRadius:"10px",boxShadow: "2px 2px 5px rgba(125, 122, 156, 0.3)"}}>Criar</button>
                <button style={{background:"#77BAB7", padding:"10px 25px", borderRadius:"10px",boxShadow: "2px 2px 5px rgba(125, 122, 156, 0.3)"}}>Jogar</button>
            </div>
        </div>
    )
}
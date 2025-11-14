import "./TelaLoginJogador.css"
import Logo from "../../../public/logo.png"
export default function TelaLoginJogador() {
    return (
        <div className="telaLoginJogador">
            <img src={Logo} alt="" height={100} width={100} />
            <div className="login">
                <h1>Login</h1>
                <div className="container"> //os container devem ter o mesmo tamanho e alinhamento
                    <div className="exibirEmoji">Variável do emoji</div>
                    <input type="text" placeholder="Nome" /> //deve exibir como background a cor aleatória escolhida pelo botão/icone (pode ser pego do MUI) de change
                    <div className="mudarEmojiCor">
                        <svg>SVG de change</svg> //deve ter cor azul que combine
                    </div>
                </div>

                <div className="container">
                    <input className="codigoSala" type="text" placeholder="Código da sala" />
                    <button className="buttonEntrar">Entrar</button>
                </div>
            </div>


        </div>
    )

}
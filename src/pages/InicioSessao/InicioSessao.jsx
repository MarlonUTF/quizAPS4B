import style from './inicioSessao.module.css';
import Header from '../../components/layout/Header/Header.jsx';
import Logo from '../../../public/logo.png'
import Jogador from '../../components/ui/Jogador/Jogador.jsx';

export default function Frame23() {
    return (
        <div className={style.inicioSessao}>
            <Header />
            <div className={style.titulo}>
                <h1 className={style.textoTitulo}>Participantes</h1>
                <img src={Logo} className={style.logo}/>
            </div>
            <div className={style.jogadores}>
                <Jogador nome="Usuário 1" />
                <Jogador nome="Usuário 2" />
                <Jogador nome="Usuário 3" />
                <Jogador nome="Usuário 4" />
                <Jogador nome="Usuário 1" />
                <Jogador nome="Usuário 2" />
                <Jogador nome="Usuário 3" />
                <Jogador nome="Usuário 4" />
                <Jogador nome="Usuário 1" />
                <Jogador nome="Usuário 2" />
                <Jogador nome="Usuário 3" />
                <Jogador nome="Usuário 4" />
                <Jogador nome="Usuário 1" />
                <Jogador nome="Usuário 2" />
                <Jogador nome="Usuário 3" />
                <Jogador nome="Usuário 4" />
                <Jogador nome="Usuário 1" />
                <Jogador nome="Usuário 2" />
                <Jogador nome="Usuário 3" />
                <Jogador nome="Usuário 4" />
            </div>
        </div>
    );
}
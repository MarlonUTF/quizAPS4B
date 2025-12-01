import Logo from '../../../public/logo.png';
import ImgPlus from "../../../public/adicionar.png"
import styles from "./Home.module.css"

export default function Home() {
    return (
        <div>
            <header className={styles.header}></header>

            <div className={styles.container}>
                <img src={Logo} alt="" height={100} width={100} />
                <h1>Olá usuário!</h1>

                <div className={styles.buttonsRow}>
                    <div className={styles.option}>
                        <button className={styles.btnAdd}>
                            <img src={ImgPlus} alt="" width={40} height={40}/>
                        </button>
                        <p>Criar nova Sala</p>
                    </div>

                    <div className={styles.option}>
                        <button className={styles.btnGreen}></button>
                        <p>Criar nova Sala</p>
                    </div>

                    <div className={styles.option}>
                        <button className={styles.btnPurple}></button>
                        <p>Criar nova Sala</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

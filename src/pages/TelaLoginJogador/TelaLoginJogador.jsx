import "./TelaLoginJogador.css";
import Logo from "../../../public/logo.png";
import ReplayIcon from "@mui/icons-material/Replay";
import { useState, useEffect } from "react";

export default function TelaLoginJogador() {
  const [nome, setNome] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para o sistema de emojis e cores
  const [usedColors, setUsedColors] = useState([]);
  const [usedEmojis, setUsedEmojis] = useState([]);
  const [currentColor, setCurrentColor] = useState("");
  const [currentEmoji, setCurrentEmoji] = useState("");

  const emojis = [
    "😀",
    "😁",
    "😆",
    "🤣",
    "😇",
    "😍",
    "🤩",
    "🥰",
    "😘",
    "😋",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤔",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🙃",
    "🤨",
    "😐",
    "😑",
  ];

  const pastelColors = [
    "rgb(255, 160, 160)", // Rosa mais forte
    "rgb(255, 180, 120)", // Pêssego mais vivo
    "rgb(255, 255, 150)", // Amarelo mais intenso
    "rgb(170, 255, 170)", // Verde mais vivo
    "rgb(150, 240, 240)", // Azul mais forte
    "rgb(190, 160, 255)", // Lilás mais vibrante
    "rgb(255, 140, 170)", // Rosa chiclete
    "rgb(255, 200, 140)", // Damasco quente
    "rgb(200, 255, 150)", // Verde-limão mais vivo
    "rgb(150, 210, 255)", // Azul céu médio
    "rgb(230, 170, 255)", // Lilás intenso
    "rgb(255, 215, 170)", // Pêssego vibrante
    "rgb(170, 255, 220)", // Verde água forte
    "rgb(170, 200, 255)", // Azul bebê mais marcante
  ];

  // Função para obter índice único sem repetição
  const getUniqueIndex = (array, usedArray) => {
    if (usedArray.length >= array.length) {
      // todos usados -> permite repetição (retorna índice aleatório)
      return Math.floor(Math.random() * array.length);
    }

    let index;
    do {
      index = Math.floor(Math.random() * array.length);
    } while (usedArray.includes(index));

    return index;
  };

  // Função para mudar emoji e cor (com reset quando todos são usados)
  const mudarEmojiECor = () => {
    // prepara cópias locais para decidir índices (não depende de setState síncrono)
    let localUsedColors =
      usedColors.length >= pastelColors.length ? [] : usedColors;
    let localUsedEmojis = usedEmojis.length >= emojis.length ? [] : usedEmojis;

    const colorIndex = getUniqueIndex(pastelColors, localUsedColors);
    const emojiIndex = getUniqueIndex(emojis, localUsedEmojis);

    setCurrentColor(pastelColors[colorIndex]);
    setCurrentEmoji(emojis[emojiIndex]);

    // atualiza estados, reiniciando arrays quando necessário e adicionando o índice escolhido
    setUsedColors((prev) =>
      prev.length >= pastelColors.length ? [colorIndex] : [...prev, colorIndex]
    );
    setUsedEmojis((prev) =>
      prev.length >= emojis.length ? [emojiIndex] : [...prev, emojiIndex]
    );
  };

  // Função de entrar
  const handleEntrar = () => {
    if (!nome.trim() || !codigoSala.trim()) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setIsLoading(true);
    // Simulação de processo de login
    setTimeout(() => {
      setIsLoading(false);
      alert(`Bem-vindo, ${nome}! Entrando na sala ${codigoSala}...`);
      // Aqui viria a lógica real de autenticação
    }, 1500);
  };

  // Tecla Enter para submit
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleEntrar();
    }
  };

  // Efeito inicial para definir primeiro emoji e cor
  useEffect(() => {
    mudarEmojiECor();
  }, []);

  function ajustarCor(rgb, brilho = 0.85, opacidade = 0.65) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `rgba(${r * brilho}, ${g * brilho}, ${b * brilho}, ${opacidade})`;
  }

  return (
    <div className="telaLoginJogador">
      <img src={Logo} alt="" className="logo" height={100} width={100} />
      <div className="container">
        <div className="login">
          <h1>Login</h1>

          <div className="inputBox">
            <div
              className="emoji"
              style={{ backgroundColor: currentColor }}
              onClick={mudarEmojiECor}
            >
              {currentEmoji}
            </div>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyPress={handleKeyPress}
              className="inputNome"
            />
            <div className="mudar" onClick={mudarEmojiECor}>
              <ReplayIcon style={{ color: "#FFFFFF" }} />
            </div>
          </div>

          <div className="inputBox">
            <input
              className="codigoSala"
              type="text"
              placeholder="Código da sala"
              value={codigoSala}
              onChange={(e) => setCodigoSala(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className={`buttonEntrar ${isLoading ? "loading" : ""}`}
              onClick={handleEntrar}
              disabled={isLoading}
            >
              {isLoading ? <div className="spinner"></div> : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import "./TelaLoginJogador.css";
import Logo from "../../../public/logo.png";
import ReplayIcon from "@mui/icons-material/Replay";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; // <-- ADICIONADO

export default function TelaLoginJogador() {
  const [nome, setNome] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para o sistema de emojis e cores
  const [usedColors, setUsedColors] = useState([]);
  const [usedEmojis, setUsedEmojis] = useState([]);
  const [currentColor, setCurrentColor] = useState("");
  const [currentEmoji, setCurrentEmoji] = useState("");

  // ============================
  // LISTAS ORIGINAIS
  // ============================

  const emojis = [
    "😀", "😁", "😆", "🤣", "😇", "😍", "🤩", "🥰", "😘",
    "😋", "🤪", "😝", "🤑", "🤗", "🤭", "🤔", "🤠", "🥳",
    "😎", "🤓", "🙃", "🤨", "😐", "😑",
  ];

  const pastelColors = [
    "rgb(255, 160, 160)", "rgb(255, 180, 120)", "rgb(255, 255, 150)",
    "rgb(170, 255, 170)", "rgb(150, 240, 240)", "rgb(190, 160, 255)",
    "rgb(255, 140, 170)", "rgb(255, 200, 140)", "rgb(200, 255, 150)",
    "rgb(150, 210, 255)", "rgb(230, 170, 255)", "rgb(255, 215, 170)",
    "rgb(170, 255, 220)", "rgb(170, 200, 255)",
  ];

  // ============================
  // FUNÇÕES ORIGINAIS
  // ============================

  const getUniqueIndex = (array, usedArray) => {
    if (usedArray.length >= array.length) {
      return Math.floor(Math.random() * array.length);
    }

    let index;
    do index = Math.floor(Math.random() * array.length);
    while (usedArray.includes(index));

    return index;
  };

  const mudarEmojiECor = () => {
    let localUsedColors = usedColors.length >= pastelColors.length ? [] : usedColors;
    let localUsedEmojis = usedEmojis.length >= emojis.length ? [] : usedEmojis;

    const colorIndex = getUniqueIndex(pastelColors, localUsedColors);
    const emojiIndex = getUniqueIndex(emojis, localUsedEmojis);

    setCurrentColor(pastelColors[colorIndex]);
    setCurrentEmoji(emojis[emojiIndex]);

    setUsedColors(prev =>
      prev.length >= pastelColors.length ? [colorIndex] : [...prev, colorIndex]
    );
    setUsedEmojis(prev =>
      prev.length >= emojis.length ? [emojiIndex] : [...prev, emojiIndex]
    );
  };

  // ============================
  // CORREÇÃO: VERIFICAR SE SESSÃO EXISTE (tabela session, não quiz)
  // ============================
  async function verificarSalaExiste() {
    const { data, error } = await supabase
      .from("session")
      .select("id")
      .eq("code", codigoSala.toUpperCase()) // Usar coluna 'code' da tabela session
      .single();

    return { exists: !!data, sessionId: data?.id };
  }

  // ============================
  // CORREÇÃO: CRIAR JOGADOR NA TABELA CORRETA (session_player)
  // ============================
  async function criarJogador(sessionId) {
    const { data, error } = await supabase
      .from("session_player")
      .insert({
        nickname: nome, // Campo correto: nickname
        session_id: sessionId, // Campo correto: session_id
        color: currentColor,
        emoji: currentEmoji,
        is_admin: false,
        connected: true
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar jogador:", error);
      alert("Erro ao criar jogador!");
      return null;
    }

    return data;
  }

  // ============================
  // NOVO: SALVAR LOCALMENTE
  // ============================
  function salvarLocal(player, sessionCode) {
    localStorage.setItem("quiz-player", JSON.stringify({
      ...player,
      room_code: sessionCode // Manter código da sala para referência
    }));
  }

  // ============================
  // NOVO: CARREGAR LOCALMENTE
  // ============================
  useEffect(() => {
    const saved = localStorage.getItem("quiz-player");
    if (saved) {
      const p = JSON.parse(saved);
      setNome(p.nickname || "");
      setCodigoSala(p.room_code || "");
      setCurrentColor(p.color || "");
      setCurrentEmoji(p.emoji || "");
    }
  }, []);

  // ============================
  // BOTÃO ENTRAR (COM LOGÍSTICA REAL)
  // ============================
  const handleEntrar = async () => {
    if (!nome.trim() || !codigoSala.trim()) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setIsLoading(true);

    // 1 — Verificar se sessão existe
    const { exists, sessionId } = await verificarSalaExiste();
    if (!exists) {
      setIsLoading(false);
      alert("❌ Sala não encontrada! Verifique o código.");
      return;
    }

    // 2 — Criar jogador na sessão
    const jogadorCriado = await criarJogador(sessionId);
    if (!jogadorCriado) {
      setIsLoading(false);
      return;
    }

    // 3 — Salvar local
    salvarLocal(jogadorCriado, codigoSala.toUpperCase());

    setIsLoading(false);

    // 4 — Redirecionar
    window.location.href = `/espera-jogador?session=${sessionId}&player=${jogadorCriado.id}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleEntrar();
  };

  useEffect(() => {
    mudarEmojiECor();
  }, []);

  function ajustarCor(rgb, brilho = 0.85, opacidade = 0.65) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `rgba(${r * brilho}, ${g * brilho}, ${b * brilho}, ${opacidade})`;
  }

  // ============================
  // RETORNO ORIGINAL (COM PEQUENOS AJUSTES)
  // ============================
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
              maxLength={50}
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
              onChange={(e) => setCodigoSala(e.target.value.toUpperCase())} // Converter para maiúsculas
              onKeyPress={handleKeyPress}
              maxLength={6}
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
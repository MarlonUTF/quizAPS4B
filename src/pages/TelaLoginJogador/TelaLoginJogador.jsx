import "./TelaLoginJogador.css";
import Logo from "../../../public/logo.png";
import ReplayIcon from "@mui/icons-material/Replay";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function TelaLoginJogador() {
  const [nome, setNome] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  
  const [usedColors, setUsedColors] = useState([]);
  const [usedEmojis, setUsedEmojis] = useState([]);
  const [currentColor, setCurrentColor] = useState("");
  const [currentEmoji, setCurrentEmoji] = useState("");
  
  const [shakeAnimation, setShakeAnimation] = useState(false);
  
  const navigate = useNavigate();
  const nomeInputRef = useRef(null);
  const codigoInputRef = useRef(null);

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

  const getUniqueIndex = (array, usedArray) => {
    if (usedArray.length >= array.length) {
      return Math.floor(Math.random() * array.length);
    }

    let index;
    do {
      index = Math.floor(Math.random() * array.length);
    } while (usedArray.includes(index));

    return index;
  };

  const mudarEmojiECor = (auto = false) => {
    if (!auto) {
      // Efeito de clique visual
      const emojiElement = document.querySelector('.emoji');
      if (emojiElement) {
        emojiElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
          emojiElement.style.transform = 'scale(1)';
        }, 150);
      }
    }

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

  // Auto-mudar a cada 5 segundos se o usuário não interagir
  useEffect(() => {
    const interval = setInterval(() => {
      mudarEmojiECor(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [usedColors, usedEmojis]);

  const verificarSalaExiste = async () => {
    const { data, error } = await supabase
      .from("session")
      .select("id, status")
      .eq("code", codigoSala.toUpperCase().trim())
      .single();

    if (error || !data) {
      return { exists: false, sessionId: null, status: null };
    }

    return { exists: true, sessionId: data.id, status: data.status };
  };

  const criarJogador = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from("session_player")
        .insert({
          nickname: nome.trim(),
          session_id: sessionId,
          color: currentColor,
          emoji: currentEmoji,
          is_admin: false,
          connected: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao criar jogador:", error);
      setError("Erro ao entrar na sala. Tente novamente.");
      setShowError(true);
      return null;
    }
  };

  const salvarLocal = (player, sessionCode) => {
    localStorage.setItem(
      "quiz-player",
      JSON.stringify({
        ...player,
        room_code: sessionCode,
        last_login: new Date().toISOString()
      })
    );
  };

  useEffect(() => {
    const saved = localStorage.getItem("quiz-player");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setNome(p.nickname || "");
        setCodigoSala(p.room_code || "");
        setCurrentColor(p.color || "");
        setCurrentEmoji(p.emoji || "");
        
        // Focar no input de código se já tiver nome
        if (p.nickname && codigoInputRef.current) {
          setTimeout(() => codigoInputRef.current.focus(), 100);
        }
      } catch (e) {
        console.error("Erro ao carregar dados salvos:", e);
      }
    } else {
      mudarEmojiECor(true);
    }
  }, []);

  const handleEntrar = async () => {
    // Reset error states
    setError("");
    setShowError(false);
    
    // Validações
    if (!nome.trim()) {
      setError("Por favor, digite seu nome");
      setShowError(true);
      nomeInputRef.current?.focus();
      triggerShake();
      return;
    }
    
    if (!codigoSala.trim()) {
      setError("Por favor, digite o código da sala");
      setShowError(true);
      codigoInputRef.current?.focus();
      triggerShake();
      return;
    }

    // Validação adicional do código
    const cleanCode = codigoSala.toUpperCase().trim();
    if (cleanCode.length < 3 || cleanCode.length > 10) {
      setError("Código da sala deve ter entre 3 e 10 caracteres");
      setShowError(true);
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      // Verificar sala
      const { exists, sessionId, status } = await verificarSalaExiste();
      
      if (!exists) {
        setError("❌ Sala não encontrada! Verifique o código.");
        setShowError(true);
        triggerShake();
        return;
      }
      
      // Verificar status da sala
      if (status && status !== 'pending') {
        setError(`A sala já está ${status === 'in_progress' ? 'em andamento' : 'finalizada'}`);
        setShowError(true);
        return;
      }

      // Criar jogador
      const jogadorCriado = await criarJogador(sessionId);
      if (!jogadorCriado) return;

      // Salvar localmente
      salvarLocal(jogadorCriado, cleanCode);

      // Pequeno delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirecionar
      navigate(`/sessao?session=${sessionId}&player=${jogadorCriado.id}`);
      
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Ocorreu um erro inesperado. Tente novamente.");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEntrar();
    }
    // Limpa erro ao começar a digitar
    if (showError) {
      setShowError(false);
      setError("");
    }
  };

  const triggerShake = () => {
    setShakeAnimation(true);
    setTimeout(() => setShakeAnimation(false), 500);
  };

  const handleLogoClick = () => {
    // Reseta tudo e gera nova combinação
    setNome("");
    setCodigoSala("");
    setError("");
    setShowError(false);
    mudarEmojiECor(false);
    
    if (nomeInputRef.current) {
      nomeInputRef.current.focus();
    }
  };

  const isFormValid = nome.trim() && codigoSala.trim();

  return (
    <div className="telaLoginJogador">
      <img 
        src={Logo} 
        alt="Quiz Logo" 
        className="logo" 
        onClick={handleLogoClick}
        title="Clique para resetar"
      />
      
      <div className="container">
        <div className="login">
          <div className="header">
            <h1>Entrar no Quiz</h1>
            <p className="subtitle">
              Escolha sua identidade e entre na sala com o código
            </p>
          </div>

          {/* Mensagem de erro */}
          {showError && (
            <div className="error-message" style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              animation: 'fadeIn 0.3s ease-out',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
            }}>
              {error}
            </div>
          )}

          <div className={`inputBox ${shakeAnimation ? 'shake' : ''}`}>
            <div
              className="emoji"
              style={{ 
                backgroundColor: currentColor,
                background: `linear-gradient(135deg, ${currentColor} 0%, ${currentColor.replace('rgb', 'rgba').replace(')', ', 0.8)')} 100%)`
              }}
              onClick={() => mudarEmojiECor(false)}
              title="Clique para mudar"
            >
              {currentEmoji}
            </div>

            <input
              ref={nomeInputRef}
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (showError) setShowError(false);
              }}
              onKeyPress={handleKeyPress}
              className="inputNome"
              maxLength={20}
              autoFocus
            />

            <button 
              className="mudar"
              onClick={() => mudarEmojiECor(false)}
              aria-label="Mudar emoji e cor"
            >
              <ShuffleIcon style={{ color: "#FFFFFF", fontSize: '1.2rem' }} />
            </button>
          </div>

          <div className="inputBox">
            <input
              ref={codigoInputRef}
              className="codigoSala"
              type="text"
              placeholder="Código da sala"
              value={codigoSala}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setCodigoSala(value);
                if (showError) setShowError(false);
              }}
              onKeyPress={handleKeyPress}
              maxLength={10}
            />

            <button
              className={`buttonEntrar ${isLoading ? 'loading' : ''} ${!isFormValid ? 'disabled' : ''}`}
              onClick={handleEntrar}
              disabled={isLoading || !isFormValid}
              style={{
                opacity: isFormValid ? 1 : 0.7,
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na Sala
                  <ArrowForwardIcon style={{ fontSize: '1.2rem' }} />
                </>
              )}
            </button>
          </div>

          <div className="instructions" style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: '#666',
            fontSize: '0.9rem',
            maxWidth: '400px',
            lineHeight: '1.5'
          }}>
            <p>✨ <strong>Dica:</strong> O código da sala é fornecido pelo host do quiz</p>
            <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
              Pressione Enter para entrar rapidamente
            </p>
          </div>
        </div>
      </div>

      {/* Decoração de fundo adicional */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        right: '2rem',
        color: 'rgba(255, 255, 255, 0.1)',
        fontSize: '0.8rem',
        textAlign: 'right',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6565ac, #258a83)',
            opacity: 0.1
          }}></div>
          <div>Quiz Experience v1.0</div>
        </div>
      </div>
    </div>
  );
}
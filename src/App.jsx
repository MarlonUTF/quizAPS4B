import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home.jsx';
import InicioSessao from './pages/InicioSessao/InicioSessao.jsx';
import NotFound from './pages/NotFound/NotFound.jsx';
import TelaInicial from './pages/TelaInicial/TelaInicial.jsx'
import CriarConta from './pages/CriarConta/CriarConta.jsx'
import TelaLoginJogador from './pages/TelaLoginJogador/TelaLoginJogador.jsx';
import TelaLoginAdm from "./pages/TelaLoginAdm/TelaLoginAdm.jsx";
import FinalSessao from "./pages/FinalSessao/FinalSessao.jsx";
import GerenciamentoSessao from "./pages/GerenciamentoSessao/GerenciamentoSessao.jsx";
import CreateQuiz from './pages/CreateQuiz/CreateQuiz.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sessao" element={<InicioSessao />} />
        <Route path="/inicio" element={<TelaInicial />} />
        <Route path="/criarconta" element={<CriarConta/>} />
        <Route path="/telaloginjogador" element={<TelaLoginJogador />} />
        <Route path="/telaloginadm" element={<TelaLoginAdm/>} />
        <Route path="/finalsessao" element={<FinalSessao/>} />
        <Route path="/gerenciamentoSessao" element={<GerenciamentoSessao/>} />
        <Route path="/criarquiz" element={<CreateQuiz/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
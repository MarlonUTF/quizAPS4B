import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import InicioSessao from './pages/InicioSessao/InicioSessao.jsx';
import NotFound from './pages/NotFound.jsx';
import TelaInicial from './pages/TelaInicial.jsx'
import CriarConta from './pages/CriarConta.jsx'
import TelaLoginJogador from './pages/TelaLoginJogador/TelaLoginJogador.jsx';
import TelaLoginAdm from "./pages/TelaLoginAdm.jsx";
import FinalSessao from "./pages/FinalSessao/FinalSessao.jsx"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sessao" element={<InicioSessao />} />
        <Route path="/inicio" element={<TelaInicial />} />
        <Route path="/criarconta" element={<CriarConta/>} />
        <Route path="*" element={<NotFound />} />
        <Route path="/telaloginjogador" element={<TelaLoginJogador />} />
        <Route path="/telaloginadm" element={<TelaLoginAdm/>} />
        <Route path="/finalsessao" element={<FinalSessao/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

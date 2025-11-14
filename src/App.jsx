import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home.jsx';
import InicioSessao from './pages/InicioSessao/InicioSessao.jsx';
import NotFound from './pages/NotFound.jsx';
import TelaLoginJogador from './pages/TelaLoginJogador.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sessao" element={<InicioSessao />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/telaloginjogador" element={<TelaLoginJogador />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

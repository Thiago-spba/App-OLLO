import { ThemeProvider } from './context/ThemeContext';
import Rotas from './routes'; // O novo arquivo de rotas, que vai ter tudo que hoje está no AppContent

function App() {
  return (
    <ThemeProvider>
      <Rotas />
    </ThemeProvider>
  );
}

export default App;

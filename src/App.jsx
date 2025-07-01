import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext.jsx';
import Rotas from './routes';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';

// Cria uma instância de histórico personalizada
const history = createBrowserHistory({ window });

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Rotas />
      </ThemeProvider>
    </AuthProvider>
  );
}

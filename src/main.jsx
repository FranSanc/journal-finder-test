import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { applyFrontiersPrimePreset } from '@/lib/frontiersTheme'
import '@/index.css'

applyFrontiersPrimePreset()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

import { PrimeReactProvider } from 'primereact/api'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import JournalFinder from './pages/JournalFinder';
import BrowseJournals from './pages/BrowseJournals';
// Add page imports here

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<JournalFinder />} />
    <Route path="/JournalFinder" element={<JournalFinder />} />
    <Route path="/BrowseJournals" element={<BrowseJournals />} />
    {/* Add your page Route elements here */}
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

function App() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <QueryClientProvider client={queryClientInstance}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </PrimeReactProvider>
  )
}

export default App

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InteractiveModalProvider } from './application/InteractiveModalProvider'
import { AppShell } from './presentation/AppShell'
import { ContentModal } from './presentation/ContentModal'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InteractiveModalProvider>
        <AppShell />
        <ContentModal />
      </InteractiveModalProvider>
    </QueryClientProvider>
  )
}

export default App

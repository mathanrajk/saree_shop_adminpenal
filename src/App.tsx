import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { adminTheme } from './theme/adminTheme';
import Navbar from './components/Navbar';
import { AddProduct, Product, EditProduct, Order, AllProduct } from './pages';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

// Vite's BASE_URL is "/" at the domain root, or "/admin/" when deployed in a sub-folder.
// BrowserRouter needs "/" or "/admin" (no trailing slash).
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

function App() {
  return (
    <ThemeProvider theme={adminTheme}>
      <QueryClientProvider client={queryClient}>
        <Router basename={basename}>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<AllProduct />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/edit-product/:productId" element={<EditProduct />} />
                <Route path="/product/edit/:productId" element={<EditProduct />} />
                <Route path="/product" element={<Product />} />
                <Route path="/orders" element={<Order />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

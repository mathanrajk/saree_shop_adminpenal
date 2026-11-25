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

function App() {
  return (
    <ThemeProvider theme={adminTheme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/all-products" replace />} />
                <Route path="/all-products" element={<AllProduct />} />
                <Route path="/all-product" element={<AllProduct />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/edit-product/:productId" element={<EditProduct />} />
                <Route path="/product/edit/:productId" element={<EditProduct />} />
                <Route path="/product" element={<Product />} />
                <Route path="/order" element={<Order />} />
                <Route path="/orders" element={<Order />} />
              </Routes>
            </main>
          </div>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

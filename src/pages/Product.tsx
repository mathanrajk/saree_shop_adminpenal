import React from 'react';
import { Navigate } from 'react-router-dom';

const Product: React.FC = () => {
  return <Navigate to="/all-products" replace />;
};

export default Product;

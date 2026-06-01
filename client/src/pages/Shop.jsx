import Products from "../components/Products"
import Layout from "../layouts/Layouts"
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Shop = () => {
   const location = useLocation();

   useEffect(() => {
      window.scrollTo(0, 0);
    }, [location]);
    return (
        <Layout>
            <Products></Products>
        </Layout>
    )
};

export default Shop;
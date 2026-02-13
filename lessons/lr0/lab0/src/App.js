import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Services from './components/Services';
import Gallery from './components/Gallery';

function App() {
  return (
    <>
      <Header />
      <main>
        <Services />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}

export default App;

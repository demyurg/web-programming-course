
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import Header from './components/Header'
import About from './components/About'
import Gallery from './components/Gallery'
import Services from './components/Services'
import Contacts from './components/Contacts'
import Footer from './components/Footer'
import './App.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <main>
        <About />
        <Gallery />
        <Services />
        <Contacts />
        <Footer />
      </main>
    </>
  )
}


export default App

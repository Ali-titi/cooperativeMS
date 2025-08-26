
import { ToastContainer } from 'react-toastify';
import './App.css'
import Dashboard from './Pages/Dashboard';
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import { Routes, Route } from 'react-router-dom';

function App() {
 

  return (
    <div className="">
<Routes >
  <Route path='/' element={<Login/>}/>
  <Route path='/signup' element={<SignUp/>}/>
  
  <Route path='/dashboard' element={<Dashboard/>}/>
</Routes>
   <ToastContainer autoClose={1000} />
    </div>
  )
}

export default App

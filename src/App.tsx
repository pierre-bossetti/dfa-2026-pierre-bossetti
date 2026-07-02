import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [token, setToken] = useState('');

    useEffect(() => {
        async function fetchToken() {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: 'admin',
                    password: 'admin'
                })
            });
            const data = await response.json();
            setToken(data.token);
        }
        fetchToken();
    }, []);

  return (
    <>
      <h3 className={"mt-5"}>Welcome</h3>
        <p>Your token: {token}</p>
    </>
  )
}

export default App

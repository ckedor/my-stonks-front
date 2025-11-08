
import { Alert, Button, Paper, Snackbar, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { loginRequest } from '../../lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  
  const navigate = useNavigate();

  const [errorOpen, setErrorOpen] = useState(false)

  const handleSubmit = async () => {
    try {
      const { access_token } = await loginRequest(username, password)
      await login(access_token)
      navigate('/portfolio/overview')
    } catch (err) {
      console.log(err)
      setErrorOpen(true)
    }
  }

  return (
    <>
      <Paper
        elevation={3}
        style={{ padding: 32, maxWidth: 400, margin: 'auto', marginTop: 100, marginBottom: 100 }}
      >
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <TextField
          label="Usuário"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Senha"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ mt: 2 }}>
          Entrar
        </Button>
      </Paper>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorOpen(false)}>
          Usuário ou senha inválidos
        </Alert>
      </Snackbar>
    </>
  )
}

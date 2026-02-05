import { usePageTitle } from '@/contexts/PageTitleContext'
import { Box, Paper, Typography } from '@mui/material'
import { useEffect } from 'react'

export default function AdminAssetsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Administração - Ativos')
  }, [setTitle])

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gerenciamento de Ativos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Área para gerenciar os ativos do sistema.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Em desenvolvimento...
        </Typography>
      </Paper>
    </Box>
  )
}

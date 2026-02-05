import { usePageTitle } from '@/contexts/PageTitleContext'
import { Box, Paper, Typography } from '@mui/material'
import { useEffect } from 'react'

export default function AdminEventsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle('Administração - Eventos')
  }, [setTitle])

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gerenciamento de Eventos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Área para gerenciar eventos do sistema (splits, bonificações, etc).
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          Em desenvolvimento...
        </Typography>
      </Paper>
    </Box>
  )
}

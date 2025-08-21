'use client'

import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import api from '@/lib/api'
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { JSX, useEffect, useState } from 'react'

type UserConfiguration = {
  id: number
  portfolio_id: number
  name: string
  enabled: boolean
  config_data: Record<string, any>
}

// Mapeamento para exibição amigável
const CONFIG_LABELS: Record<string, JSX.Element> = {
  foxbit_integration: (
    <Typography variant="body1">
      <strong>Integração com Foxbit:</strong> Atualização de transações de criptomoeda na corretora
      Foxbit
    </Typography>
  ),
  fiis_dividends_integration: (
    <Typography variant="body1">
      <strong>Dividendos de FIIs:</strong> Atualização automática dos dividendos pagos pelos FIIs em
      carteira
    </Typography>
  ),
}

export default function UserConfigurationPage() {
  const { selectedPortfolio } = usePortfolio()
  const { setTitle } = usePageTitle()

  const [configurations, setConfigurations] = useState<UserConfiguration[]>([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  )

  useEffect(() => {
    setTitle('Configurações do Portfólio')
  }, [setTitle])

  useEffect(() => {
    if (!selectedPortfolio?.id) return
    fetchConfigurations()
  }, [selectedPortfolio])

  const fetchConfigurations = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/portfolio/${selectedPortfolio?.id}/user_configurations`)
      setConfigurations(res.data.configurations)
    } catch (err) {
      console.log('Erro ao carregar configurações:', err)
      setSnackbar({ message: 'Erro ao carregar configurações', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (name: string, enabled: boolean) => {
    try {
      await api.put(`/portfolio/${selectedPortfolio?.id}/user_configuration`, {
        configuration: name,
        enabled: !enabled,
      })
      setConfigurations((prev) =>
        prev.map((c) => (c.name === name ? { ...c, enabled: !enabled } : c))
      )
      setSnackbar({ message: 'Configuração atualizada', type: 'success' })
    } catch {
      setSnackbar({ message: 'Erro ao atualizar configuração', type: 'error' })
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Stack spacing={3} maxWidth={600} width="100%">
          {configurations.map((config) => (
            <FormControlLabel
              key={config.name}
              control={
                <Switch
                  checked={config.enabled}
                  onChange={() => handleToggle(config.name, config.enabled)}
                />
              }
              label={CONFIG_LABELS[config.name] ?? config.name}
              labelPlacement="end"
              sx={{
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': {
                  mt: '2px',
                },
              }}
            />
          ))}
          {configurations.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Nenhuma configuração disponível
            </Typography>
          )}
        </Stack>
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.type} variant="filled" onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

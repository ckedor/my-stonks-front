'use client'

import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EditIcon from '@mui/icons-material/Edit'
import ListAltIcon from '@mui/icons-material/ListAlt'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import PaidIcon from '@mui/icons-material/Paid'
import SavingsIcon from '@mui/icons-material/Savings'
import SettingsIcon from '@mui/icons-material/Settings'
import TokenIcon from '@mui/icons-material/Token'

import CategoryForm from '@/components/CategoryForm'
import DividendForm from '@/components/DividendForm'
import TradeForm from '@/components/TradeForm'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const FONT_SIZE_LABEL = 16
const FONT_SIZE_HEADER = '1.4rem'

const assetClassPages = [
  { text: 'Renda Fixa', icon: '/icons/fixed-income.png', path: '/portfolio/fixed-income' },
  { text: 'Cripto', icon: '/icons/crypto.png', path: '/portfolio/cripto' },
  { text: 'Ações BR', icon: '/icons/stocks-br.png', path: '/portfolio/stocks-br' },
  { text: 'Ações EUA', icon: '/icons/stocks-us.png', path: '/portfolio/stocks-us' },
  { text: 'Previdência', icon: '/icons/pension.png', path: '/portfolio/pension' },
  { text: 'FIIs', icon: '/icons/fii.png', path: '/portfolio/fii' },
]

const menuItems = [
  { text: 'Resumo', icon: <DashboardIcon fontSize="small" />, path: '/portfolio' },
  { text: 'Ativos', icon: <TokenIcon fontSize="small" />, path: '/portfolio/asset' },
  { text: 'Rentabilidade', icon: <PaidIcon fontSize="small" />, path: '/portfolio/returns' },
  { text: 'Patrimônio', icon: <SavingsIcon fontSize="small" />, path: '/portfolio/wealth' },
  { text: 'Trades', icon: <ListAltIcon fontSize="small" />, path: '/portfolio/trades' },
  {
    text: 'Proventos',
    icon: <MonetizationOnIcon fontSize="small" />,
    path: '/portfolio/dividends',
  },
  { text: 'Declaração IR', icon: <ListAltIcon fontSize="small" />, path: '/portfolio/tax-income' },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [tradeFormOpen, setTradeFormOpen] = useState(false)
  const [dividendFormOpen, setDividendFormOpen] = useState(false)

  return (
    <>
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: 260,
            pt: 2,
            pb: 1,
            bgcolor: '#fff',
            overflow: 'hidden',
          },
        }}
      >
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ fontWeight: 'bold', fontSize: FONT_SIZE_HEADER, mb: '9px' }}
        >
          Moneys
        </Typography>

        <Divider sx={{ mb: 1 }} />

        <List dense>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => router.push(item.path)}
              selected={pathname === item.path}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: FONT_SIZE_LABEL }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List dense>
          {assetClassPages.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => router.push(item.path)}
              selected={pathname === item.path}
            >
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Box
                  component="img"
                  src={item.icon}
                  alt={item.text}
                  sx={{ width: 18, height: 18 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: FONT_SIZE_LABEL }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List dense>
          <ListItemButton onClick={() => setTradeFormOpen(true)}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Cadastrar Compra"
              primaryTypographyProps={{ fontSize: FONT_SIZE_LABEL }}
            />
          </ListItemButton>

          <ListItemButton onClick={() => setDividendFormOpen(true)}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Cadastrar Provento"
              primaryTypographyProps={{ fontSize: FONT_SIZE_LABEL }}
            />
          </ListItemButton>

          <ListItemButton onClick={() => setCategoryFormOpen(true)}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Editar Categorias"
              primaryTypographyProps={{ fontSize: FONT_SIZE_LABEL }}
            />
          </ListItemButton>
        </List>

        <Divider sx={{ my: 1 }} />
        <List dense>
          <ListItemButton onClick={() => router.push('/portfolio/user-configurations')}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Configurações"
              primaryTypographyProps={{ fontSize: FONT_SIZE_LABEL }}
            />
          </ListItemButton>
        </List>
      </Drawer>

      <CategoryForm open={categoryFormOpen} onClose={() => setCategoryFormOpen(false)} />
      <TradeForm open={tradeFormOpen} onClose={() => setTradeFormOpen(false)} assetId={0} />
      <DividendForm open={dividendFormOpen} onClose={() => setDividendFormOpen(false)} />
    </>
  )
}

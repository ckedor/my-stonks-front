'use client'

import PortfolioForm from '@/components/PortfolioForm'
import { useAuth } from '@/contexts/AuthContext'
import { usePageTitle } from '@/contexts/PageTitleContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import AccountCircle from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMore from '@mui/icons-material/ExpandMore'
import {
  AppBar,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

export default function Topbar() {
  const { user, logout } = useAuth()
  const { portfolios, loading, refreshPortfolio, selectedPortfolio, setSelectedPortfolio } =
    usePortfolio()

  const [selected, setSelected] = useState<number | null>(selectedPortfolio?.id ?? null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const { title } = usePageTitle()

  const [openForm, setOpenForm] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (selectedPortfolio && selected !== selectedPortfolio.id) {
      setSelected(selectedPortfolio.id)
    }
  }, [selectedPortfolio])

  const handleOpenCreate = () => {
    setEditMode(false)
    setOpenForm(true)
  }

  const handleOpenEdit = () => {
    setEditMode(true)
    setOpenForm(true)
  }

  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <Select
                value={selected ?? ''}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value === -1) {
                    handleOpenEdit()
                    return
                  }
                  if (value === -2) {
                    handleOpenCreate()
                    return
                  }
                  setSelected(value)
                  const portfolio = portfolios.find((p) => p.id === value)
                  if (portfolio) setSelectedPortfolio(portfolio)
                }}
                size="small"
                IconComponent={ExpandMore}
                sx={{ minWidth: 150 }}
                renderValue={(value) => {
                  const portfolio = portfolios.find((p) => p.id === value)
                  return portfolio?.name || ''
                }}
              >
                {portfolios.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
                <ListSubheader>──────────</ListSubheader>
                <MenuItem value={-1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EditIcon sx={{ color: 'primary.main' }} fontSize="small" />
                    <Typography sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                      Editar Carteira
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value={-2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AddIcon sx={{ color: 'primary.main' }} fontSize="small" />
                    <Typography sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                      Nova Carteira
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            )}

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>{user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={logout}>Sair</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <PortfolioForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(newId) => {
          refreshPortfolio(newId ?? undefined)
          setSelected(newId ?? null)
          setOpenForm(false)
        }}
        portfolio={editMode ? (selectedPortfolio ?? undefined) : undefined}
      />
    </>
  )
}

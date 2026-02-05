import PortfolioForm from '@/components/PortfolioForm'
import { useAuth } from '@/contexts/AuthContext'
import { usePortfolio } from '@/contexts/PortfolioContext'

import AccountCircle from '@mui/icons-material/AccountCircle'
import AddIcon from '@mui/icons-material/Add'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMore from '@mui/icons-material/ExpandMore'
import SettingsIcon from '@mui/icons-material/Settings'

import {
    AppBar,
    Box,
    Button,
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
import { useLocation, useNavigate } from 'react-router-dom'

import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton'

export type Section = 'carteira' | 'mercado'

export function getCurrentSection(pathname: string): Section {
  if (pathname.startsWith('/market')) return 'mercado'
  return 'carteira'
}

export default function MainTopbar() {
  const { user, logout } = useAuth()
  const { portfolios, loading, selectedPortfolio, setSelectedPortfolio } = usePortfolio()
  const navigate = useNavigate()
  const location = useLocation()

  const [selected, setSelected] = useState<number | null>(selectedPortfolio?.id ?? null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const [openForm, setOpenForm] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const currentSection = getCurrentSection(location.pathname)

  // Sync selected portfolio
  useEffect(() => {
    if (selectedPortfolio && selected !== selectedPortfolio.id) {
      setSelected(selectedPortfolio.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPortfolio])

  const handleOpenCreate = () => {
    setEditMode(false)
    setOpenForm(true)
  }
  const handleOpenEdit = () => {
    setEditMode(true)
    setOpenForm(true)
  }

  const handleSectionClick = (section: Section) => {
    if (section === 'carteira') {
      navigate('/portfolio/overview')
    } else {
      navigate('/market/assets')
    }
  }

  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'topbar.background' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 'bold', cursor: 'pointer', color: 'topbar.text' }}
              onClick={() => navigate('/portfolio/overview')}
            >
              My Stonks
            </Typography>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'topbar.text', opacity: 0.3 }} />

            <Button
              onClick={() => handleSectionClick('carteira')}
              sx={{
                textTransform: 'none',
                fontWeight: currentSection === 'carteira' ? 'bold' : 'normal',
                color: 'topbar.text',
                borderBottom: currentSection === 'carteira' ? 2 : 0,
                borderColor: 'topbar.text',
                borderRadius: 0,
              }}
            >
              Carteira
            </Button>
            <Button
              onClick={() => handleSectionClick('mercado')}
              sx={{
                textTransform: 'none',
                fontWeight: currentSection === 'mercado' ? 'bold' : 'normal',
                color: 'topbar.text',
                borderBottom: currentSection === 'mercado' ? 2 : 0,
                borderColor: 'topbar.text',
                borderRadius: 0,
              }}
            >
              Mercado
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ThemeToggleButton />
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <>
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
                  sx={{ 
                    minWidth: 150, 
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  }}
                  renderValue={(value) => portfolios.find((p) => p.id === value)?.name || ''}
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
              </>
            )}

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'topbar.text' }}>
              <AccountCircle />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              <MenuItem disabled>
                <Typography variant="body2">{user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  navigate('/portfolio/user-configurations')
                  setAnchorEl(null)
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <SettingsIcon fontSize="small" />
                  <Typography>Configurações</Typography>
                </Box>
              </MenuItem>
              {user?.is_admin && (
                <MenuItem
                  onClick={() => {
                    navigate('/admin')
                    setAnchorEl(null)
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <AdminPanelSettingsIcon fontSize="small" />
                    <Typography>Admin</Typography>
                  </Box>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <PortfolioForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        portfolio={editMode ? selectedPortfolio ?? undefined : undefined}
      />
    </>
  )
}

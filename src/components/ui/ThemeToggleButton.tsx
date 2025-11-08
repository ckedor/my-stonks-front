import { useThemeMode } from '@/theme'; // seu hook do ThemeRegistry
import { DarkMode, LightMode } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

export function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode()

  const icon =
    mode === 'dark'
    ? <DarkMode  sx={{ color: '#eeb227ff' }} />   
    : <LightMode sx={{ color: '#eeb227ff' }} />    
  return (
    <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="alternar tema"
        sx={{ ml: 1 }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  )
}

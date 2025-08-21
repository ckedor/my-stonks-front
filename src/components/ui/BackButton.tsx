'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Button, ButtonProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

const BackButtonRoot = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  color: 'inherit',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
  },
}))

interface BackButtonProps {
  label?: string
  fallbackHref?: string
  size?: ButtonProps['size']
}

export default function BackButton({
  label = 'Voltar',
  fallbackHref = '/',
  size = 'small',
}: BackButtonProps) {
  const router = useRouter()

  return (
    <BackButtonRoot
      startIcon={<ArrowBackIcon />}
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push(fallbackHref)
        }
      }}
      size={size}
      variant="text"
    >
      {label}
    </BackButtonRoot>
  )
}

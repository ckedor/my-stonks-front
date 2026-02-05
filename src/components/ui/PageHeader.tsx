import { usePageTitle } from '@/contexts/PageTitleContext'
import { Typography } from '@mui/material'

export default function PageHeader() {
  const { title } = usePageTitle()

  if (!title) return null

  return (
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
      {title}
    </Typography>
  )
}

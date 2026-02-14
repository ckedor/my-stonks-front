import { Asset } from '@/types'
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material'

interface AssetDetailsCardProps {
  asset: Asset
}

function InfoRow({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} color={color ?? 'text.primary'}>
        {value}
      </Typography>
    </Box>
  )
}

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatReturn(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return { text: '—', color: 'text.secondary' }
  const pct = value * 100
  return {
    text: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
    color: pct > 0 ? 'success.main' : pct < 0 ? 'error.main' : 'text.primary',
  }
}

export default function AssetDetailsCard({ asset }: AssetDetailsCardProps) {
  const accReturn = formatReturn(asset.acc_return)
  const twelveReturn = formatReturn(asset.twelve_months_return)

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Header: Ticker + Chips */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="h5" fontWeight="bold" lineHeight={1.2}>
              {asset.ticker}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mt: 0.5,
              }}
            >
              {asset.name}
            </Typography>
          </Box>
          <Stack direction="column" spacing={0.5} alignItems="flex-end">
            <Chip
              label={asset.asset_type?.short_name}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={asset.asset_type?.asset_class?.name}
              size="small"
              variant="filled"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Valor total destaque */}
        <Box textAlign="left" mb={1.5}>
          <Typography variant="caption" color="text.secondary">
            Valor Total
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatCurrency(asset.value)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Position info */}
        <InfoRow label="Quantidade" value={asset.quantity.toLocaleString('pt-BR', { maximumFractionDigits: 8 })} />
        <InfoRow label="Preço Atual" value={formatCurrency(asset.price)} />
        <InfoRow label="Preço Médio" value={formatCurrency(asset.average_price)} />

        <Divider sx={{ my: 1.5 }} />

        {/* Returns */}
        <InfoRow label="Rentabilidade 12m" value={twelveReturn.text} color={twelveReturn.color} />
        <InfoRow label="Rent. Acumulada" value={accReturn.text} color={accReturn.color} />

        {/* Fixed income details */}
        {asset.fixed_income && (
          <>
            <Divider sx={{ my: 1.5 }} />
            {asset.fixed_income.index?.name && (
              <InfoRow label="Índice" value={asset.fixed_income.index.name} />
            )}
            {asset.fixed_income.fee != null && (
              <InfoRow label="Taxa" value={`${(asset.fixed_income.fee * 100).toFixed(2)}%`} />
            )}
            {asset.fixed_income.maturity_date && (
              <InfoRow label="Vencimento" value={String(asset.fixed_income.maturity_date)} />
            )}
            {asset.fixed_income.fixed_income_type?.name && (
              <InfoRow label="Tipo RF" value={asset.fixed_income.fixed_income_type.name} />
            )}
          </>
        )}

        {/* Fund details */}
        {asset.fund && (
          <>
            <Divider sx={{ my: 1.5 }} />
            {asset.fund.anbima_category && (
              <InfoRow label="Categoria ANBIMA" value={asset.fund.anbima_category} />
            )}
            {asset.fund.anbima_code && (
              <InfoRow label="Código ANBIMA" value={asset.fund.anbima_code} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

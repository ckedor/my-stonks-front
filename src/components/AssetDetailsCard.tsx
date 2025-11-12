import { Box, Grid, Typography } from '@mui/material'

interface AssetDetailsCardProps {
  asset: any
}

function DetailField({
  label,
  value,
  isReturn = false,
}: {
  label: string
  value: string | number | null | undefined
  isReturn?: boolean
}) {
  const isNull = value === null || value === undefined || Number.isNaN(value)
  const numericValue =
    typeof value === 'number' ? value : parseFloat(String(value).replace('%', '')) / 100

  const displayValue = isReturn
    ? isNull
      ? '—'
      : (numericValue * 100).toFixed(2) + '%'
    : (value ?? '—')

  const color = !isReturn || isNull ? 'text.primary' : numericValue > 0 ? 'success.main' : 'error.main'

  return (
    <Grid size={{ xs: 4, md: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
      <Typography fontWeight="bold" color={color}>
        {displayValue}
      </Typography>
    </Grid>
  )
}

export default function AssetDetailsCard({ asset }: AssetDetailsCardProps) {
  return (
    <Box p={3} boxShadow={3} borderRadius={2} sx={{ backgroundColor: 'background.paper' }}>

      <Grid container spacing={3}>
        <DetailField label="Classe" value={asset.asset_type.asset_class.name} />
        <DetailField label="Tipo" value={asset.asset_type.name} />
        <DetailField label="Quantidade" value={asset.quantity.toFixed(8)} />
        <DetailField
          label="Valor Total"
          value={`R$ ${asset.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
        />
        <DetailField
          label="Preço Atual"
          value={`R$ ${asset.price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
        />
        <DetailField
          label="Preço Médio"
          value={`R$ ${asset.average_price.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`}
        />
        <DetailField label="Rent. 12m" value={asset.twelve_months_return} isReturn />
        <DetailField label="Rentabilidade Acumulada" value={asset.acc_return} isReturn />

        {asset.fixed_income && (
          <>
            <DetailField label="Taxa" value={asset.fixed_income.fee} isReturn />
            <DetailField label="Vencimento" value={asset.fixed_income.maturity_date} />
            <DetailField label="Índice" value={asset.fixed_income.index?.name} />
            <DetailField
              label="Tipo Renda Fixa"
              value={asset.fixed_income.fixed_income_type?.name}
            />
          </>
        )}

        {asset.fund && (
          <>
            <DetailField label="Categoria ANBIMA" value={asset.fund.anbima_category} />
            <DetailField label="Código ANBIMA" value={asset.fund.anbima_code} />
          </>
        )}
      </Grid>
    </Box>
  )
}

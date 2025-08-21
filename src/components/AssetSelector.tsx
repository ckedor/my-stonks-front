'use client'

import api from '@/lib/api'
import { Asset } from '@/types'
import {
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import { useEffect, useMemo, useState } from 'react'

interface AssetType {
  id: number
  short_name: string
}

interface AssetSelectorProps {
  value: number | null
  onChange: (asset: Asset | null) => void
}

export default function AssetSelector({ value, onChange }: AssetSelectorProps) {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedType, setSelectedType] = useState<number | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [typesRes, assetsRes] = await Promise.all([
          api.get('assets/types'),
          api.get('assets/assets'),
        ])
        setAssetTypes(typesRes.data)
        setAssets(assetsRes.data)
      } catch (err) {
        console.error('Erro ao carregar dados de ativos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAssets = useMemo(
    () => (selectedType ? assets.filter((a) => a.asset_type_id === selectedType) : []),
    [assets, selectedType]
  )

  const selectedAsset = useMemo(
    () => filteredAssets.find((a) => a.id === value) || null,
    [filteredAssets, value]
  )

  return (
    <Grid container direction="row" spacing={2} alignItems="center">
      <Grid size={{ xs: 4 }}>
        <FormControl fullWidth>
          <InputLabel>Tipo de Ativo</InputLabel>
          <Select
            value={selectedType}
            label="Tipo de Ativo"
            onChange={(e) => setSelectedType(Number(e.target.value))}
          >
            {assetTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.short_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 8 }}>
        <Autocomplete
          options={filteredAssets}
          getOptionLabel={(option) => `${option.ticker}`}
          value={selectedAsset}
          isOptionEqualToValue={(option, val) => option.id === val.id}
          onChange={(_, newValue) => onChange(newValue ?? null)}
          disabled={!selectedType || loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ativo"
              placeholder="Selecione o ativo"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

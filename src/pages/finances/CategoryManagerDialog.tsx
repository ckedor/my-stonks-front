import {
    createCategory,
    createSubcategory,
    deleteCategory,
    deleteSubcategory,
    updateCategory,
    updateSubcategory,
    type FinanceCategory,
} from '@/lib/financeApi'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material'
import { useCallback, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  categories: FinanceCategory[]
  onRefresh: () => void
}

export default function CategoryManagerDialog({ open, onClose, categories, onRefresh }: Props) {
  const [loading, setLoading] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newSubName, setNewSubName] = useState('')
  const [newSubCatId, setNewSubCatId] = useState<number | ''>('')
  const [editingCat, setEditingCat] = useState<{ id: number; name: string } | null>(null)
  const [editingSub, setEditingSub] = useState<{ id: number; name: string } | null>(null)
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null)

  const wrap = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true)
    try {
      await fn()
      onRefresh()
    } catch {
      setSnack({ msg: 'Erro ao salvar', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [onRefresh])

  const handleCreateCat = () => {
    if (!newCatName.trim()) return
    wrap(async () => {
      await createCategory(newCatName.trim())
      setNewCatName('')
    })
  }

  const handleCreateSub = () => {
    if (!newSubName.trim() || !newSubCatId) return
    wrap(async () => {
      await createSubcategory(newSubName.trim(), newSubCatId as number)
      setNewSubName('')
      setNewSubCatId('')
    })
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Categorias & Subcategorias
          {loading && <CircularProgress size={20} />}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 480 }}>
          {/* New category */}
          <Box display="flex" gap={1} mb={2}>
            <TextField
              size="small"
              label="Nova categoria"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCat()}
              fullWidth
            />
            <IconButton color="primary" onClick={handleCreateCat} disabled={loading}>
              <AddIcon />
            </IconButton>
          </Box>

          {/* Category list */}
          {categories.map((cat) => (
            <Box key={cat.id} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                {editingCat?.id === cat.id ? (
                  <>
                    <TextField
                      size="small"
                      value={editingCat.name}
                      onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          wrap(async () => {
                            await updateCategory(editingCat.id, editingCat.name)
                            setEditingCat(null)
                          })
                        }
                      }}
                      fullWidth
                    />
                    <IconButton size="small" onClick={() => wrap(async () => { await updateCategory(editingCat.id, editingCat.name); setEditingCat(null) })}>
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setEditingCat(null)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Typography fontWeight="bold" flex={1}>{cat.name}</Typography>
                    <IconButton size="small" onClick={() => setEditingCat({ id: cat.id, name: cat.name })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => wrap(async () => { await deleteCategory(cat.id) })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>

              <List dense disablePadding sx={{ pl: 3 }}>
                {cat.subcategories.map((sub) => (
                  <ListItem
                    key={sub.id}
                    secondaryAction={
                      editingSub?.id === sub.id ? (
                        <Box display="flex" gap={0.5}>
                          <IconButton size="small" onClick={() => wrap(async () => { await updateSubcategory(editingSub.id, editingSub.name); setEditingSub(null) })}>
                            <SaveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditingSub(null)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box display="flex" gap={0.5}>
                          <IconButton size="small" onClick={() => setEditingSub({ id: sub.id, name: sub.name })}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => wrap(async () => { await deleteSubcategory(sub.id) })}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )
                    }
                    sx={{ py: 0 }}
                  >
                    {editingSub?.id === sub.id ? (
                      <TextField
                        size="small"
                        value={editingSub.name}
                        onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            wrap(async () => { await updateSubcategory(editingSub.id, editingSub.name); setEditingSub(null) })
                          }
                        }}
                        variant="standard"
                      />
                    ) : (
                      <ListItemText primary={sub.name} />
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}

          {categories.length > 0 && <Divider sx={{ my: 2 }} />}

          {/* New subcategory */}
          <Typography variant="subtitle2" mb={1}>Nova subcategoria</Typography>
          <Box display="flex" gap={1}>
            <Select
              size="small"
              value={newSubCatId}
              onChange={(e) => setNewSubCatId(e.target.value as number)}
              displayEmpty
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="" disabled>Categoria</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              label="Nome"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSub()}
              fullWidth
            />
            <IconButton color="primary" onClick={handleCreateSub} disabled={loading}>
              <AddIcon />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack?.severity} onClose={() => setSnack(null)}>{snack?.msg}</Alert>
      </Snackbar>
    </>
  )
}

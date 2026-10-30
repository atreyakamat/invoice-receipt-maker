import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, List, ListItem,
  ListItemIcon, ListItemText, Typography, Alert,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { apiPrivate, errorMessage } from '../api/axios';
import { fileSize } from '../lib/format';
import { useToast } from './ToastContext';

const ACCEPT = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
const MAX_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 20;

const UploadContext = createContext<{ openUpload: (files?: File[]) => void }>({ openUpload: () => {} });

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast();

  const addFiles = useCallback((incoming: File[]) => {
    const bad: string[] = [];
    const good = incoming.filter(f => {
      if (!ACCEPT.includes(f.type)) bad.push(`${f.name}: unsupported type`);
      else if (f.size > MAX_SIZE) bad.push(`${f.name}: larger than 25 MB`);
      else return true;
      return false;
    });
    setRejected(bad);
    setError('');
    setFiles(prev => {
      const merged = [...prev, ...good.filter(g => !prev.some(p => p.name === g.name && p.size === g.size))];
      return merged.slice(0, MAX_FILES);
    });
  }, []);

  const openUpload = useCallback(
    (initial?: File[]) => {
      setOpen(true);
      if (initial?.length) addFiles(initial);
    },
    [addFiles],
  );

  const close = () => {
    if (progress !== null) return;
    setOpen(false);
    setFiles([]);
    setRejected([]);
    setError('');
  };

  // Dropping files anywhere in the app opens the dialog with them.
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files');
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e) || !localStorage.getItem('accessToken')) return;
      depth++;
      setDragging(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (!depth) setDragging(false);
    };
    const onOver = (e: DragEvent) => hasFiles(e) && e.preventDefault();
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      if (localStorage.getItem('accessToken')) openUpload(Array.from(e.dataTransfer!.files));
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [openUpload]);

  const upload = async () => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    setProgress(0);
    setError('');
    try {
      const res = await apiPrivate.post('/invoices/upload', form, {
        onUploadProgress: e => setProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 50),
      });
      const created: { id: string }[] = res.data.invoices;
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast(`${created.length} document${created.length === 1 ? '' : 's'} uploaded`);
      setProgress(null);
      close();
      setOpen(false);
      setFiles([]);
      navigate(created.length === 1 ? `/invoices/${created[0].id}` : '/invoices');
    } catch (err) {
      setProgress(null);
      setError(errorMessage(err, 'Upload failed'));
    }
  };

  return (
    <UploadContext.Provider value={{ openUpload }}>
      {children}

      <AnimatePresence>
        {dragging && !open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'none' }}
          >
            <Box
              sx={{
                position: 'absolute', inset: 12, borderRadius: 4, border: '2px dashed', borderColor: 'primary.main',
                bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)', backdropFilter: 'blur(2px)',
                display: 'grid', placeItems: 'center',
              }}
            >
              <Box sx={{ textAlign: 'center', color: 'primary.main' }}>
                <CloudUploadOutlinedIcon sx={{ fontSize: 56 }} />
                <Typography variant="h5">Drop to upload</Typography>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1 }}>Upload documents</DialogTitle>
        <DialogContent>
          <Box
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              addFiles(Array.from(e.dataTransfer.files));
            }}
            sx={{
              border: '1.5px dashed', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center', cursor: 'pointer',
              transition: 'all .2s', outline: 'none',
              '&:hover, &:focus-visible': { borderColor: 'primary.main', bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.04)' },
            }}
          >
            <CloudUploadOutlinedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography sx={{ fontWeight: 600 }}>Drop files or click to browse</Typography>
            <Typography variant="body2" color="text.secondary">PDF, JPG, PNG, TIFF · up to 25 MB · {MAX_FILES} files</Typography>
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              accept={ACCEPT.join(',')}
              onChange={e => {
                addFiles(Array.from(e.target.files || []));
                e.target.value = '';
              }}
            />
          </Box>

          {rejected.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }} onClose={() => setRejected([])}>
              {rejected.map(r => <div key={r}>{r}</div>)}
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          {files.length > 0 && (
            <List dense sx={{ mt: 1, maxHeight: 260, overflow: 'auto' }}>
              <AnimatePresence initial={false}>
                {files.map(f => (
                  <motion.div key={f.name + f.size} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <ListItem
                      disableGutters
                      secondaryAction={
                        progress === null && (
                          <IconButton size="small" aria-label={`Remove ${f.name}`} onClick={() => setFiles(prev => prev.filter(p => p !== f))}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {f.type === 'application/pdf' ? <PictureAsPdfOutlinedIcon color="error" /> : <ImageOutlinedIcon color="primary" />}
                      </ListItemIcon>
                      <ListItemText primary={f.name} secondary={fileSize(f.size)} slotProps={{ primary: { noWrap: true } }} />
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          )}

          {progress !== null && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, borderRadius: 1, height: 6 }} />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={close} disabled={progress !== null} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={upload} disabled={!files.length || progress !== null}>
            {progress !== null ? `Uploading ${progress}%` : files.length ? `Upload ${files.length}` : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </UploadContext.Provider>
  );
};

export const useUpload = () => useContext(UploadContext);

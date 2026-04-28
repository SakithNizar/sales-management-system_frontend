import { Modal, Box, Typography, Button } from '@mui/material';
import { useForm } from 'react-hook-form';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  children: React.ReactNode;
  defaultValues?: any;
}

export default function FormModal({ open, onClose, onSubmit, title, children, defaultValues }: FormModalProps) {
  const { handleSubmit } = useForm({ defaultValues });

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {children}
          <Button type="submit" variant="contained" sx={ { mt: 2 } }>
            Save
          </Button>
          <Button onClick={onClose} sx={{ mt: 2, ml: 2 }}>
            Cancel
          </Button>
        </form>
      </Box>
    </Modal>
  );
}
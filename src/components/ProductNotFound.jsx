import { Alert, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export default function ProductNotFound() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Alert severity="warning">
        Product not found. It may have been removed, or the link is incorrect.
      </Alert>
      <Button variant="contained" component={Link} to="/products">
        Back to Products
      </Button>
    </Stack>
  );
}
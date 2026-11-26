import { Alert, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Alert severity="warning">The page you are looking for does not exist.</Alert>
      <Button variant="contained" component={Link} to="/">
        Go to Dashboard
      </Button>
    </Stack>
  );
}
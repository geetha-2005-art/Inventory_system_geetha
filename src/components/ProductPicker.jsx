import { Autocomplete, Box, TextField, Typography } from '@mui/material';

export default function ProductPicker({ products, value, onChange, error, helperText }) {
  const selected = products.find((p) => p.id === value) || null;

  return (
    <Autocomplete
      options={products}
      value={selected}
      onChange={(_event, product) => onChange(product ? product.id : '')}
      getOptionLabel={(p) => `${p.code} - ${p.name}`}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText="No active products found"
      renderOption={(props, p) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest}>
            <Box>
              <Typography variant="body2">
                {p.code} - {p.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                In stock: {p.availableStock} {p.unit}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label="Product" required error={error} helperText={helperText} />
      )}
    />
  );
}
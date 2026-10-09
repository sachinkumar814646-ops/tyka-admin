import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const CustomDatePicker = ({
  label = "Select Date",
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  fullWidth = true,
  size = "small",
  format = "DD/MM/YYYY",
  minDate,
  maxDate,
  error = false,
  helperText = "",
  sx = {},
}) => {
  const [open, setOpen] = useState(false);

  const handleChange = (newValue) => {
    onChange?.(newValue, name);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={handleChange}
        format={format}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        sx={sx}
        slotProps={{
          textField: {
            fullWidth,
            size,
            required,
            error,
            helperText,
            onClick: () => setOpen(true), // Open calendar on click anywhere
            sx: {
              cursor: "pointer",
              "& .MuiInputBase-input": {
                cursor: "pointer",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
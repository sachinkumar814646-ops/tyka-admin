import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export default function MultiSelect({
  label,
  placeholder = "Search...",
  options = [],
  value = [],
  onChange,
  getOptionLabel = (option) => option.name,
  getOptionValue = (option) => option.id,
  max = Infinity,
  disabled = false,
}) {
const selectedOptions = (options || []).filter((option) =>
  (value || []).includes(getOptionValue(option))
);

  return (
    <div>
      {label && (
        <label className="block font-medium mb-2">
          {label}
        </label>
      )}

      <Autocomplete
        multiple
        options={options}
        value={selectedOptions}
        disabled={disabled}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, val) =>
          getOptionValue(option) === getOptionValue(val)
        }
        filterSelectedOptions
onChange={(event, newValue = []) => {
  if (newValue.length <= max) {
    onChange(newValue.map(getOptionValue));
  }
}}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            size="small"
          />
        )}
      />

      {max !== Infinity && (
        <p className="text-xs text-gray-500 mt-2">
          Maximum {max} selections allowed.
        </p>
      )}
    </div>
  );
}
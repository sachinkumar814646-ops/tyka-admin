import * as Select from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const CustomSelect = ({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select Option",
  className = "",
  disabled = false,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="form-label"
        >
          {label}
        </label>
      )}

      <Select.Root
        value={value ? String(value) : ""}
        onValueChange={onChange}
        disabled={disabled}
      >
        <Select.Trigger
          id={id}
          className="
            flex
            h-11
            w-full
            items-center
            justify-between
            rounded-lg
            border
            border-slate-300
            bg-white
            px-3
            text-sm
            text-slate-700
            shadow-sm
            transition-all
            hover:border-slate-400
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-200
            data-[placeholder]:text-slate-400
            disabled:cursor-not-allowed
            disabled:bg-slate-100
          "
        >
          <Select.Value placeholder={placeholder} />

          <Select.Icon>
            <ChevronDown size={18} />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={5}
            className="
              z-[9999]
              w-[var(--radix-select-trigger-width)]
              min-w-[var(--radix-select-trigger-width)]
              overflow-hidden
              rounded-lg
              border
              border-slate-200
              bg-white
              shadow-xl
            "
          >
            <Select.ScrollUpButton className="flex h-8 items-center justify-center bg-white">
              <ChevronUp size={16} />
            </Select.ScrollUpButton>

            <Select.Viewport className="max-h-60 p-1">
              {options.length > 0 ? (
                options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={String(option.value)}
                    className="
                      relative
                      flex
                      h-10
                      cursor-pointer
                      select-none
                      items-center
                      rounded-md
                      px-3
                      text-sm
                      text-slate-700
                      outline-none
                      data-[highlighted]:bg-indigo-100
                      data-[highlighted]:text-slate-900
                    "
                  >
                    <Select.ItemText>
                      {option.label}
                    </Select.ItemText>

                    <Select.ItemIndicator className="absolute right-3">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              )}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex h-8 items-center justify-center bg-white">
              <ChevronDown size={16} />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
};

export default CustomSelect;
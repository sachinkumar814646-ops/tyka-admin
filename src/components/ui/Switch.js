import * as React from "react";

export default function Switch({ checked, onCheckedChange, ...props }) {
  return (
    <input
      type="checkbox"
      role="switch"
      className="h-4 w-8 cursor-pointer"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  );
}

import { clsx } from "clsx";

const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "text-foreground border border-input",

    success: "bg-green-100 text-green-800",
    inactive: "bg-red-100 text-red-800",
  };

  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
};

export default Badge;

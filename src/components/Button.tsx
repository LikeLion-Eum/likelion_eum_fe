import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  size?: "sm" | "md";
};

export default function Button({ variant="primary", size="md", className, ...rest }: Props) {
  return (
    <button
      className={clsx(
        "btn",
        variant==="primary" ? "btn-primary" : "btn-outline",
        size==="sm" ? "h-9 px-3 text-sm" : "h-10 px-4",
        className
      )}
      {...rest}
    />
  );
}

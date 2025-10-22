import { css, cva } from "../../styled-system/css";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import type { RecipeVariant } from "../../styled-system/types";

const buttonRecipe = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    cursor: "pointer",
    borderRadius: "md",
    fontWeight: "600",
    transition: "colors",
    _disabled: { opacity: 0.5, cursor: "not-allowed" },
    _focusVisible: {
      outline: "2px solid token(colors.blue.500)",
      outlineOffset: "2px",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "blue.600",
        color: "white",
        _hover: { bg: "blue.700" },
        _active: { bg: "blue.800" },
      },
      outline: {
        color: "blue.700",
        borderWidth: "1px",
        borderColor: "blue.300",
        _hover: { bg: "blue.50" },
        _active: { bg: "blue.100" },
      },
      ghost: {
        color: "blue.700",
        _hover: { bg: "blue.50" },
        _active: { bg: "blue.100" },
      },
    },
    size: {
      sm: { h: "8", px: "3", textStyle: "sm" },
      md: { h: "10", px: "4", textStyle: "md" },
      lg: { h: "12", px: "5", textStyle: "lg" },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
});

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    RecipeVariant<typeof buttonRecipe> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={css(buttonRecipe.raw({ variant, size }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

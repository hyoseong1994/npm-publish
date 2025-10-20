import type { Meta, StoryObj } from "@storybook/react";
import { Button, type ButtonProps } from "./Button";

const meta: Meta<ButtonProps> = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: ["solid", "outline", "ghost"],
    },
    size: { control: { type: "radio" }, options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Solid: Story = { args: { variant: "solid" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };

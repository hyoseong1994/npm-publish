import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeTruthy();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="outline" size="lg">
        Action
      </Button>
    );
    const btn = screen.getByRole("button", { name: /action/i });
    expect(btn).toBeTruthy();
  });
});

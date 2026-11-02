import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ChipOption } from "@/components/ui/ChipOption";

test("is a real checkbox that can be toggled and is sent with the form", () => {
  render(
    <form aria-label="form">
      <ChipOption type="checkbox" name="category" value="1">
        Eletricista
      </ChipOption>
    </form>,
  );
  const checkbox = screen.getByRole("checkbox", { name: "Eletricista" });
  expect(checkbox).not.toBeChecked();
  fireEvent.click(screen.getByText("Eletricista"));
  expect(checkbox).toBeChecked();
  const data = new FormData(screen.getByRole("form", { name: "form" }) as HTMLFormElement);
  expect(data.getAll("category")).toEqual(["1"]);
});

test("can be a radio", () => {
  render(
    <ChipOption type="radio" name="category" value="2" defaultChecked>
      Encanador
    </ChipOption>,
  );
  expect(screen.getByRole("radio", { name: "Encanador" })).toBeChecked();
});

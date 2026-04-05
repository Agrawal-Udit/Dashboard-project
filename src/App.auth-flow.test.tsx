import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { useAppStore } from "./store/store";

describe("App auth flow", () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
    window.history.pushState({}, "", "/");
  });

  it("redirects unauthenticated users to login", async () => {
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("supports login and logout roundtrip", async () => {
    render(<App />);

    const username = await screen.findByLabelText(/username/i);
    fireEvent.change(username, { target: { value: "demo" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "demo123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(
      await screen.findByRole("heading", { name: /sign in/i }),
    ).toBeInTheDocument();
  });
});

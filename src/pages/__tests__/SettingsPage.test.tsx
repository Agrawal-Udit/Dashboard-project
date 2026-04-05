import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsPage } from "../SettingsPage";
import { useAppStore } from "../../store/store";

describe("SettingsPage reset permissions", () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true);
  });

  it("hides reset button for Viewer role", () => {
    useAppStore.setState({ role: "Viewer" });

    render(<SettingsPage />);

    expect(
      screen.queryByRole("button", { name: /reset data/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/admin role required to reset data/i),
    ).toBeInTheDocument();
  });

  it("shows reset button for Admin role", () => {
    useAppStore.setState({ role: "Admin" });

    render(<SettingsPage />);

    expect(
      screen.getByRole("button", { name: /reset data/i }),
    ).toBeInTheDocument();
  });
});

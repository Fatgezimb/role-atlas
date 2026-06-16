import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

describe("Role Atlas app", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  });

  it("renders the map-first workspace with ranked roles and analytics", async () => {
    render(<App />);

    expect(await screen.findByText("Role Atlas")).toBeInTheDocument();
    expect(screen.getByLabelText("United States job map")).toBeInTheDocument();
    expect(screen.getAllByText("Remote BCBA - Contract")[0]).toBeInTheDocument();
    expect(screen.getByText("Median hourly")).toBeInTheDocument();
  });

  it("opens the role dropdown and switches between BCBA and PMHNP roles", async () => {
    render(<App />);

    expect((await screen.findAllByText("Remote BCBA - Contract"))[0]).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("filter-role"));
    fireEvent.click(screen.getByRole("menuitem", { name: "PMHNP" }));

    await waitFor(() => expect(screen.getByText("Telehealth PMHNP - Contract")).toBeInTheDocument());
    expect(screen.queryAllByText("Remote BCBA - Contract")).toHaveLength(0);
  });

  it("opens the selected role modal and returns to results on close", async () => {
    render(<App />);

    const selectedCard = (await screen.findAllByText("Remote BCBA - Contract"))[0];
    fireEvent.click(selectedCard);

    const dialog = await screen.findByRole("dialog", { name: "Remote BCBA - Contract" });
    expect(within(dialog).getByText("License eligibility")).toBeInTheDocument();
    expect(within(dialog).getByText("Remote classification")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByText("Close"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("updates saved state from the result card", async () => {
    render(<App />);

    await screen.findAllByText("Remote BCBA - Contract");
    const buttons = screen.getAllByLabelText("Save role");
    fireEvent.click(buttons[0]);

    await waitFor(() => expect(screen.getAllByLabelText("Unsave role")[0]).toBeInTheDocument());
  });

  it("marks results as map-filtered when the map zoom changes", async () => {
    render(<App />);

    await screen.findAllByText("Remote BCBA - Contract");
    fireEvent.click(screen.getByLabelText("Zoom in"));

    await waitFor(() => expect(screen.getByText("Map-filtered results")).toBeInTheDocument());
    expect(screen.getByText(/total in search/i)).toBeInTheDocument();
  });

  it("opens pay distribution buckets with matching roles and can drill into role detail", async () => {
    render(<App />);

    await screen.findAllByText("Remote BCBA - Contract");
    fireEvent.click(screen.getByRole("button", { name: /Open \$90-\$99\/hr pay bucket/i }));

    const payDialog = await screen.findByRole("dialog", { name: "Roles in $90-$99/hr" });
    expect(within(payDialog).getByText("roles in this bucket")).toBeInTheDocument();
    expect(within(payDialog).getAllByText("Open role")[0]).toBeInTheDocument();

    fireEvent.click(within(payDialog).getAllByText("Open role")[0]);

    const detailDialog = await screen.findByRole("dialog", { name: "Remote BCBA - Contract" });
    expect(within(detailDialog).getByText("License eligibility")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Roles in $90-$99/hr" })).not.toBeInTheDocument();
  });
});

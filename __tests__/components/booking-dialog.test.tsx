import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingDialog from "@/components/booking-dialog";

// Mock sonner toast
const { mockToastSuccess } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: vi.fn(),
  },
}));

// Mock the Dialog UI components to render plain HTML
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    open,
    children,
  }: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    children: React.ReactNode;
  }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <h2 className={className}>{children}</h2>,
}));

// Mock Input to render plain input
vi.mock("@/components/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

// Mock Label to render plain label
vi.mock("@/components/ui/label", () => ({
  Label: ({
    children,
    ...props
  }: React.LabelHTMLAttributes<HTMLLabelElement> & {
    children: React.ReactNode;
  }) => <label {...props}>{children}</label>,
}));

// Mock Button to render plain button
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  }) => <button {...props}>{children}</button>,
}));

describe("BookingDialog", () => {
  const defaultProps = {
    selectedRoom: 101 as number | null,
    onClose: vi.fn(),
    onBooked: vi.fn(),
  };

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when selectedRoom is not null", () => {
    render(<BookingDialog {...defaultProps} />);
    expect(screen.getByText(/Check In — Cabana 101/)).toBeInTheDocument();
  });

  it("does not render when selectedRoom is null", () => {
    render(<BookingDialog {...defaultProps} selectedRoom={null} />);
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("shows room number and guest name inputs", () => {
    render(<BookingDialog {...defaultProps} />);
    expect(screen.getByPlaceholderText("e.g. 101")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Alice Smith")).toBeInTheDocument();
  });

  it("shows submit button", () => {
    render(<BookingDialog {...defaultProps} />);
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("clears form fields when dialog opens with new room", () => {
    const { rerender } = render(
      <BookingDialog {...defaultProps} selectedRoom={null} />,
    );
    rerender(<BookingDialog {...defaultProps} selectedRoom={201} />);

    const roomInput = screen.getByPlaceholderText(
      "e.g. 101",
    ) as HTMLInputElement;
    const nameInput = screen.getByPlaceholderText(
      "e.g. Alice Smith",
    ) as HTMLInputElement;

    expect(roomInput.value).toBe("");
    expect(nameInput.value).toBe("");
  });

  it("submits form and shows success toast on successful booking", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          message: "Welcome, Alice Smith! Checked into cabana 101.",
          cabanaNumber: 101,
        }),
    });

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "101");
    await user.type(
      screen.getByPlaceholderText("e.g. Alice Smith"),
      "Alice Smith",
    );
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Welcome, Alice Smith! Checked into cabana 101.",
        expect.objectContaining({ style: expect.any(Object) }),
      );
    });

    expect(defaultProps.onBooked).toHaveBeenCalledWith(101);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows form error on failed booking (404)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          error: "No matching booking found for this room and guest name.",
        }),
    });

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "999");
    await user.type(
      screen.getByPlaceholderText("e.g. Alice Smith"),
      "Wrong",
    );
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "No matching booking found for this room and guest name.",
        ),
      ).toBeInTheDocument();
    });

    // Dialog stays open on error
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(defaultProps.onBooked).not.toHaveBeenCalled();
  });

  it("shows form error on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "101");
    await user.type(
      screen.getByPlaceholderText("e.g. Alice Smith"),
      "Alice",
    );
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(
        screen.getByText("Network error. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("clears form error when typing in room input", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Some error" }),
    });

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "x");
    await user.type(screen.getByPlaceholderText("e.g. Alice Smith"), "x");
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Some error")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("e.g. 101"), "1");

    expect(screen.queryByText("Some error")).not.toBeInTheDocument();
  });

  it("clears form error when typing in guest name input", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Some error" }),
    });

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "x");
    await user.type(screen.getByPlaceholderText("e.g. Alice Smith"), "x");
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Some error")).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText("e.g. Alice Smith"), "a");

    expect(screen.queryByText("Some error")).not.toBeInTheDocument();
  });

  it("sends correct payload to /api/book", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: "OK", cabanaNumber: 101 }),
    });
    global.fetch = mockFetch;

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "101");
    await user.type(
      screen.getByPlaceholderText("e.g. Alice Smith"),
      "Alice Smith",
    );
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "101",
          guestName: "Alice Smith",
          cabanaNumber: 101,
        }),
      });
    });
  });

  it("shows already booked error from API (409)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ error: "Cabana 101 is already booked." }),
    });

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "101");
    await user.type(
      screen.getByPlaceholderText("e.g. Alice Smith"),
      "Alice",
    );
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(
        screen.getByText("Cabana 101 is already booked."),
      ).toBeInTheDocument();
    });
  });

  it("shows generic error when API returns no error message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });

    const user = userEvent.setup();
    render(<BookingDialog {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("e.g. 101"), "101");
    await user.type(
      screen.getByPlaceholderText("e.g. Alice Smith"),
      "Alice",
    );
    await user.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(screen.getByText("Booking failed.")).toBeInTheDocument();
    });
  });
});

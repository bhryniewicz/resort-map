import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import ResortMap from "@/components/resort-map";

// Mock next/image to render plain img tags
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock sonner toast
const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mockToastError,
    success: vi.fn(),
  },
}));

// Mock BookingDialog
vi.mock("@/components/booking-dialog", () => ({
  default: ({
    selectedRoom,
    onClose,
  }: {
    selectedRoom: number | null;
    onClose: () => void;
    onBooked: (n: number) => void;
  }) =>
    selectedRoom !== null ? (
      <div data-testid="booking-dialog">
        <span>Booking for room {selectedRoom}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

const SIMPLE_MAP = "...\nW.W\n...\n";

function mockFetch(
  mapData: { map: string } | null,
  bookingsData: {
    bookings: Array<{ room: string; guestName: string }>;
    bookedCabanas: number[];
  } | null,
  mapOk = true,
  bookingsOk = true,
) {
  global.fetch = vi.fn((url: string | URL | Request) => {
    const urlStr =
      typeof url === "string"
        ? url
        : url instanceof URL
          ? url.toString()
          : url.url;

    if (urlStr.includes("/api/map")) {
      return Promise.resolve(
        new Response(
          JSON.stringify(mapOk ? mapData : { error: "fail" }),
          { status: mapOk ? 200 : 500 },
        ),
      );
    }
    if (urlStr.includes("/api/bookings")) {
      return Promise.resolve(
        new Response(
          JSON.stringify(bookingsOk ? bookingsData : { error: "fail" }),
          { status: bookingsOk ? 200 : 500 },
        ),
      );
    }
    return Promise.resolve(new Response("{}", { status: 404 }));
  }) as typeof fetch;
}

describe("ResortMap component", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as typeof fetch;
    render(<ResortMap />);
    expect(screen.getByText("Loading resort map...")).toBeInTheDocument();
  });

  it("renders cabana tiles after loading", async () => {
    mockFetch(
      { map: SIMPLE_MAP },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      const cabanas = screen.getAllByAltText("Cabana");
      expect(cabanas).toHaveLength(2);
    });
  });

  it("shows error when map fetch fails", async () => {
    mockFetch(null, { bookings: [], bookedCabanas: [] }, false, true);

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load map/)).toBeInTheDocument();
    });
  });

  it("shows error when bookings fetch fails", async () => {
    mockFetch({ map: SIMPLE_MAP }, null, true, false);

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load bookings/)).toBeInTheDocument();
    });
  });

  it("displays room numbers as title attributes on cabanas", async () => {
    mockFetch(
      { map: SIMPLE_MAP },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByTitle("Room 101")).toBeInTheDocument();
      expect(screen.getByTitle("Room 102")).toBeInTheDocument();
    });
  });

  it("opens booking dialog when clicking unbooked cabana", async () => {
    mockFetch(
      { map: SIMPLE_MAP },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByTitle("Room 101")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Room 101"));

    await waitFor(() => {
      expect(screen.getByTestId("booking-dialog")).toBeInTheDocument();
      expect(screen.getByText("Booking for room 101")).toBeInTheDocument();
    });
  });

  it("shows error toast when clicking already booked cabana", async () => {
    mockFetch(
      { map: SIMPLE_MAP },
      { bookings: [], bookedCabanas: [101] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByTitle("Room 101")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Room 101"));

    expect(mockToastError).toHaveBeenCalledWith(
      "Room 101 is already booked!",
      expect.objectContaining({ style: expect.any(Object) }),
    );
  });

  it("does not open dialog when clicking booked cabana", async () => {
    mockFetch(
      { map: SIMPLE_MAP },
      { bookings: [], bookedCabanas: [101] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByTitle("Room 101")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Room 101"));

    expect(screen.queryByTestId("booking-dialog")).not.toBeInTheDocument();
  });

  it("renders path tiles with correct alt text", async () => {
    mockFetch(
      { map: "W#W\n" },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByAltText("Path")).toBeInTheDocument();
    });
  });

  it("renders pool tiles", async () => {
    mockFetch(
      { map: "p\n" },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByAltText("Pool")).toBeInTheDocument();
    });
  });

  it("renders chalet tiles", async () => {
    mockFetch(
      { map: "c\n" },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByAltText("Chalet")).toBeInTheDocument();
    });
  });

  it("closes booking dialog via onClose", async () => {
    mockFetch(
      { map: SIMPLE_MAP },
      { bookings: [], bookedCabanas: [] },
    );

    render(<ResortMap />);

    await waitFor(() => {
      expect(screen.getByTitle("Room 101")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle("Room 101"));

    await waitFor(() => {
      expect(screen.getByTestId("booking-dialog")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));

    await waitFor(() => {
      expect(screen.queryByTestId("booking-dialog")).not.toBeInTheDocument();
    });
  });
});

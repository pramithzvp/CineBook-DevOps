
package lk.cinebook;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private static final ZoneId ZONE =
            ZoneId.of("Asia/Colombo");

    private static final Set<String> CINEMAS = Set.of(
            "colombo",
            "kandy",
            "scope-havelock",
            "scope-ccc"
    );

    private final BookingService bookingService;

    public ShowController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // GET /api/shows?movieId=...&cinema=...
    @GetMapping
    public List<Map<String, Object>> getShows(
            @RequestParam String movieId,
            @RequestParam String cinema
    ) {

        List<Map<String, Object>> shows = new ArrayList<>();

        if (!BookingService.TIMES.containsKey(movieId)
                || !CINEMAS.contains(cinema)) {
            return shows;
        }

        ZonedDateTime now = ZonedDateTime.now(ZONE);

        List<String> times = BookingService.TIMES.get(movieId);

        int basePrice = BookingService.PRICES.get(movieId);
        int bookingFee = 100;

        for (int day = 0; day < 7; day++) {

            LocalDate date = now.toLocalDate().plusDays(day);

            for (String time : times) {

                LocalDateTime showDateTime =
                        LocalDateTime.of(
                                date,
                                LocalTime.parse(time)
                        );

                if (!showDateTime.isAfter(now.toLocalDateTime())) {
                    continue;
                }

                String showId = movieId + "~"
                        + cinema + "~"
                        + date + "~"
                        + time;

                Map<String, Object> show = new LinkedHashMap<>();

                show.put("id", showId);
                show.put("date", date.toString());
                show.put("time", time);
                show.put("hall", "Demo Hall 1");
                show.put("basePrice", basePrice);
                show.put("bookingFee", bookingFee);

                shows.add(show);
            }
        }

        return shows;
    }

    // GET /api/shows/{showId}/seats
    @GetMapping("/{showId}/seats")
    public Map<String, Object> getSeats(
            @PathVariable String showId
    ) {

        // Show ID format:
        // movieId~cinema~date~time
        String[] parts = showId.split("~", -1);

        if (parts.length != 4) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid show ID."
            );
        }

        String movieId = parts[0];
        String cinema = parts[1];
        String date = parts[2];
        String time = parts[3];

        List<String> reservedSeats;

        try {
            // Reads already booked seats from MySQL.
            // Also validates movie, cinema, date and time.
            reservedSeats = bookingService.availability(
                    movieId,
                    date,
                    time,
                    cinema
            );
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    ex.getMessage()
            );
        }

        Set<String> reserved = new HashSet<>(reservedSeats);

        int basePrice = BookingService.PRICES.get(movieId);
        int bookingFee = 100;

        List<Map<String, Object>> seats = new ArrayList<>();

        // Generate seats A1 to H8.
        for (char row = 'A'; row <= 'H'; row++) {

            for (int number = 1; number <= 8; number++) {

                String label = "" + row + number;

                Map<String, Object> seat = new LinkedHashMap<>();

                seat.put("label", label);

                // Keep the same price calculation
                // as BookingService.book().
                seat.put("price", basePrice + bookingFee);

                // Reserved seats cannot be selected.
                seat.put("available", !reserved.contains(label));

                seats.add(seat);
            }
        }

        return Map.of("seats", seats);
    }
}

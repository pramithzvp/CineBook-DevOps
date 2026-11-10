package lk.cinebook;

import java.util.List;

/** Accepts both the showId payload from the current seat picker and the
 * expanded show fields used by the older booking dialog. */
public record BookingSubmission(
    String showId,
    String requestKey,
    String movieId,
    String date,
    String time,
    String cinema,
    List<String> seats,
    String name,
    String email
) {}

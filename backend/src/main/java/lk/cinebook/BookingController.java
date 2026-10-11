package lk.cinebook;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import jakarta.validation.Valid;
import java.util.*;
@RestController
@RequestMapping("/api")
public class BookingController {
 private final BookingService service;
 private final org.springframework.jdbc.core.JdbcTemplate database;
 public BookingController(BookingService service, org.springframework.jdbc.core.JdbcTemplate database){this.service=service;this.database=database;}
 @GetMapping("/health") public Map<String,String> health(){database.queryForObject("SELECT 1",Integer.class);return Map.of("application","CineBook","status","ok","database","UP");}
 @GetMapping("/availability") public Map<String,Object> availability(@RequestParam String movieId,@RequestParam String date,@RequestParam String time,@RequestParam String cinema){return Map.of("seats",service.availability(movieId,date,time,cinema));}
 @PostMapping("/bookings") public ResponseEntity<Map<String,Object>> book(@Valid @RequestBody BookingRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.book(r));}
}

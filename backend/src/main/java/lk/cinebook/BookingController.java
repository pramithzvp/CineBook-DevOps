package lk.cinebook;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import jakarta.validation.Valid;
import java.util.*;
@RestController
@RequestMapping("/api")
public class BookingController {
 private final BookingService service;
 public BookingController(BookingService service){this.service=service;}
 @GetMapping("/health") public Map<String,String> health(){return Map.of("status","ok");}
 @GetMapping("/availability") public Map<String,Object> availability(@RequestParam String movieId,@RequestParam String date,@RequestParam String time,@RequestParam String cinema){return Map.of("seats",service.availability(movieId,date,time,cinema));}
 @PostMapping("/bookings") public ResponseEntity<Map<String,Object>> book(@Valid @RequestBody BookingRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(service.book(r));}
}

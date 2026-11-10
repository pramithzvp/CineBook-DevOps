package lk.cinebook;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.*;
@RestController
@RequestMapping("/api")
public class BookingController {
 private final BookingService service;
 private final org.springframework.jdbc.core.JdbcTemplate database;
 public BookingController(BookingService service, org.springframework.jdbc.core.JdbcTemplate database){this.service=service;this.database=database;}
 @GetMapping("/health") public Map<String,String> health(){database.queryForObject("SELECT 1",Integer.class);return Map.of("application","CineBook","status","ok","database","UP");}
 @GetMapping("/availability") public Map<String,Object> availability(@RequestParam String movieId,@RequestParam String date,@RequestParam String time,@RequestParam String cinema){return Map.of("seats",service.availability(movieId,date,time,cinema));}
 @GetMapping("/bookings") public List<Map<String,Object>> bookings(HttpServletRequest request){
  HttpSession session=request.getSession(true);
  return service.listForOwner(BookingSession.ownerKey(session));
 }
 @PostMapping("/bookings") public ResponseEntity<Map<String,Object>> book(@RequestBody BookingSubmission submission,HttpServletRequest request){
  String movieId=submission.movieId(),date=submission.date(),time=submission.time(),cinema=submission.cinema();
  if(submission.showId()!=null&&!submission.showId().isBlank()){
   String[] parts=submission.showId().split("~",-1);
   if(parts.length!=4)throw new IllegalArgumentException("Choose a valid showtime.");
   movieId=parts[0];cinema=parts[1];date=parts[2];time=parts[3];
  }
  BookingRequest booking=new BookingRequest(movieId,date,time,cinema,submission.seats(),submission.name(),submission.email());
  return ResponseEntity.status(HttpStatus.CREATED).body(service.book(booking,BookingSession.ownerKey(request.getSession(true))));
 }
}

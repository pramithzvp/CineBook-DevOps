package lk.cinebook;
import java.util.Map;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> invalid(IllegalArgumentException ex){return ResponseEntity.badRequest().body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(){return ResponseEntity.badRequest().body(Map.of("message","Please check your name, email and selected seats."));}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict(){return ResponseEntity.status(409).body(Map.of("message","One of these seats was just reserved. Go back and choose other seats."));}
 @ExceptionHandler(DataAccessException.class) ResponseEntity<?> database(){return ResponseEntity.status(503).body(Map.of("message","Reservations are temporarily unavailable. Please try again."));}
}

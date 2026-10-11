package lk.cinebook;
import java.util.Map;
import org.springframework.dao.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import lk.cinebook.auth.service.EmailAlreadyExistsException;
import lk.cinebook.auth.service.InvalidCredentialsException;
import lk.cinebook.auth.service.UnauthenticatedException;
@RestControllerAdvice
public class ApiErrors {
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<?> invalid(IllegalArgumentException ex){return ResponseEntity.badRequest().body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation(){return ResponseEntity.badRequest().body(Map.of("message","Please check the supplied fields."));}
 @ExceptionHandler(EmailAlreadyExistsException.class) ResponseEntity<?> duplicateEmail(EmailAlreadyExistsException ex){return ResponseEntity.status(409).body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(InvalidCredentialsException.class) ResponseEntity<?> invalidCredentials(InvalidCredentialsException ex){return ResponseEntity.status(401).body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(UnauthenticatedException.class) ResponseEntity<?> unauthenticated(UnauthenticatedException ex){return ResponseEntity.status(401).body(Map.of("message",ex.getMessage()));}
 @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict(){return ResponseEntity.status(409).body(Map.of("message","One of these seats was just reserved. Go back and choose other seats."));}
 @ExceptionHandler(DataAccessException.class) ResponseEntity<?> database(){return ResponseEntity.status(503).body(Map.of("message","Reservations are temporarily unavailable. Please try again."));}
}

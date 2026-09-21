package lk.cinebook;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataIntegrityViolationException;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:cinebook;MODE=MySQL;DB_CLOSE_DELAY=-1","spring.datasource.username=sa","spring.datasource.password=","spring.datasource.driver-class-name=org.h2.Driver"})
class BookingServiceTest {
 @Autowired BookingService service;
 @Autowired JdbcTemplate db;
 String date=LocalDate.now(ZoneId.of("Asia/Colombo")).plusDays(1).toString();
 BookingRequest request(List<String> seats){return new BookingRequest("dune",date,"19:00","colombo",seats,"Test Guest","test@example.com");}
 @BeforeEach void clear(){db.update("DELETE FROM reserved_seats");db.update("DELETE FROM bookings");}
 @Test void correctPriceAndSeatAvailability(){var b=service.book(request(List.of("A1","A2")));assertEquals(4600,b.get("total"));assertEquals(List.of("A1","A2"),service.availability("dune",date,"19:00","colombo"));}
 @Test void seatConflictRollsBackWholeBooking(){service.book(request(List.of("A2")));assertThrows(DataIntegrityViolationException.class,()->service.book(request(List.of("A1","A2"))));assertEquals(1,db.queryForObject("SELECT COUNT(*) FROM bookings",Integer.class));assertEquals(List.of("A2"),service.availability("dune",date,"19:00","colombo"));}
 @Test void rejectsDuplicatesAndPastDates(){assertThrows(IllegalArgumentException.class,()->service.book(request(List.of("A1","A1"))));assertThrows(IllegalArgumentException.class,()->service.validateShow("dune","2020-01-01","19:00","colombo"));}
}

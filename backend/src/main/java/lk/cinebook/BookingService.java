package lk.cinebook;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
@Service
public class BookingService {
 private final JdbcTemplate db;
 public BookingService(JdbcTemplate db){this.db=db;}
 static final Map<String,List<String>> TIMES=Map.ofEntries(
  Map.entry("dune",List.of("11:00","15:00","19:00")),
  Map.entry("interstellar",List.of("10:30","14:30","18:30")),
  Map.entry("batman",List.of("11:30","15:30","19:30")),
  Map.entry("oppenheimer",List.of("12:00","16:00","20:00")),
  Map.entry("avatar",List.of("11:15","15:45","19:45")),
  Map.entry("gaadi",List.of("13:00","17:00","21:00")),
  Map.entry("ho-gaana-pokuna",List.of("10:00","14:00","18:00")),
  Map.entry("maharaja",List.of("10:00","14:00","18:00")),
  Map.entry("96",List.of("10:00","14:00","18:00")),
  Map.entry("inception",List.of("10:00","14:00","18:00")),
  Map.entry("parasite",List.of("10:00","14:00","18:00")),
  Map.entry("train-to-busan",List.of("10:00","14:00","18:00")),
  Map.entry("your-name",List.of("10:00","14:00","18:00")),
  Map.entry("spirited-away",List.of("10:00","14:00","18:00")),
  Map.entry("amelie",List.of("10:00","14:00","18:00")),
  Map.entry("intouchables",List.of("10:00","14:00","18:00")),
  Map.entry("spider-man-brand-new-day",List.of("11:00","15:00","19:00")),
  Map.entry("eda-re-sinhala",List.of("10:00","14:00","18:00","21:00")),
  Map.entry("the-odyssey",List.of("10:00","14:00","18:00","21:00")),
  Map.entry("moana",List.of("10:00","14:00","18:00","21:00")),
  Map.entry("mandaadi-tamil",List.of("10:00","14:00","18:00","21:00")),
  Map.entry("resident-evil",List.of("10:00","14:00","18:00","21:00")),
  Map.entry("the-end-of-oak-street",List.of("10:00","14:00","18:00","21:00")),
  Map.entry("man-hoyanne-premayak-sinhala",List.of("10:00","14:00","18:00","21:00"))
 );
 static final Map<String,Integer> PRICES=Map.ofEntries(
  Map.entry("dune",2200),
  Map.entry("interstellar",1500),
  Map.entry("batman",1800),
  Map.entry("oppenheimer",2200),
  Map.entry("avatar",1800),
  Map.entry("gaadi",1500),
  Map.entry("ho-gaana-pokuna",1500),
  Map.entry("maharaja",1500),
  Map.entry("96",1500),
  Map.entry("inception",1500),
  Map.entry("parasite",1500),
  Map.entry("train-to-busan",1500),
  Map.entry("your-name",1500),
  Map.entry("spirited-away",1500),
  Map.entry("amelie",1500),
  Map.entry("intouchables",1500),
  Map.entry("spider-man-brand-new-day",1800),
  Map.entry("eda-re-sinhala",1500),
  Map.entry("the-odyssey",1500),
  Map.entry("moana",1500),
  Map.entry("mandaadi-tamil",1500),
  Map.entry("resident-evil",1500),
  Map.entry("the-end-of-oak-street",1500),
  Map.entry("man-hoyanne-premayak-sinhala",1500)
 );
 void validateShow(String movie,String date,String time,String cinema){
  if(!TIMES.containsKey(movie)||!TIMES.get(movie).contains(time)||!Set.of("colombo","kandy","scope-havelock","scope-ccc").contains(cinema))throw new IllegalArgumentException("Choose a valid movie, cinema and showtime.");
  LocalDate d;try{d=LocalDate.parse(date);}catch(Exception ex){throw new IllegalArgumentException("Choose a valid date.");}
  ZonedDateTime now=ZonedDateTime.now(ZoneId.of("Asia/Colombo"));
  if(d.isBefore(now.toLocalDate())||d.isAfter(now.toLocalDate().plusDays(6))||!LocalDateTime.of(d,LocalTime.parse(time)).isAfter(now.toLocalDateTime()))throw new IllegalArgumentException("Choose an upcoming show within the next 7 days.");
 }
 public List<String> availability(String movie,String date,String time,String cinema){
  validateShow(movie,date,time,cinema);
  return db.queryForList("SELECT seat FROM reserved_seats WHERE movie_id=? AND show_date=? AND show_time=? AND cinema=? ORDER BY seat",String.class,movie,date,time,cinema);
 }
 @Transactional
 public Map<String,Object> book(BookingRequest r){
  validateShow(r.movieId(),r.date(),r.time(),r.cinema());
  if(r.seats()==null||r.seats().isEmpty()||r.seats().size()>8||new HashSet<>(r.seats()).size()!=r.seats().size()||r.seats().stream().anyMatch(s->s==null||!s.matches("[A-H][1-8]")))throw new IllegalArgumentException("Choose 1–8 different valid seats.");
  String id="CB-"+UUID.randomUUID();int total=r.seats().size()*(PRICES.get(r.movieId())+100);
  db.update("INSERT INTO bookings(id,movie_id,show_date,show_time,cinema,guest_name,email,total) VALUES(?,?,?,?,?,?,?,?)",id,r.movieId(),r.date(),r.time(),r.cinema(),r.name().trim(),r.email().trim(),total);
  // Sorted inserts reduce deadlocks; the composite primary key prevents double-booking,
  // including simultaneous requests. Any conflict rolls back the whole transaction.
  for(String seat:r.seats().stream().sorted().toList())db.update("INSERT INTO reserved_seats(movie_id,show_date,show_time,cinema,seat,booking_id) VALUES(?,?,?,?,?,?)",r.movieId(),r.date(),r.time(),r.cinema(),seat,id);
  return Map.of("id",id,"movieId",r.movieId(),"date",r.date(),"time",r.time(),"cinema",r.cinema(),"seats",r.seats(),"name",r.name().trim(),"total",total);
 }
}

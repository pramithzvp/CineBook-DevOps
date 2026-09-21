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
 static final Map<String,List<String>> TIMES=Map.of("dune",List.of("11:00","15:00","19:00"),"interstellar",List.of("10:30","14:30","18:30"),"batman",List.of("11:30","15:30","19:30"));
 static final Map<String,Integer> PRICES=Map.of("dune",2200,"interstellar",1500,"batman",1800);
 void validateShow(String movie,String date,String time,String cinema){
  if(!TIMES.containsKey(movie)||!TIMES.get(movie).contains(time)||!Set.of("colombo","kandy").contains(cinema))throw new IllegalArgumentException("Choose a valid movie, cinema and showtime.");
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

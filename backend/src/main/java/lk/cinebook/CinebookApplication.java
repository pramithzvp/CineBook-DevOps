package lk.cinebook;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.*;
@SpringBootApplication
public class CinebookApplication {
 public static void main(String[] args) { SpringApplication.run(CinebookApplication.class,args); }
 @Bean WebMvcConfigurer cors(@Value("${cinebook.allowed-origin}") String origin) {
  return new WebMvcConfigurer(){public void addCorsMappings(CorsRegistry registry){registry.addMapping("/api/**").allowedOrigins(origin,"http://localhost:5173").allowedMethods("GET","POST","PUT","DELETE").allowedHeaders("Content-Type");}};
 }
}

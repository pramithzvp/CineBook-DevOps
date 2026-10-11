package lk.cinebook;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.*;
@SpringBootApplication
public class CinebookApplication {
 public static void main(String[] args) { SpringApplication.run(CinebookApplication.class,args); }
 @Bean WebMvcConfigurer cors(@Value("${cinebook.allowed-origin}") String origin) {
    return new WebMvcConfigurer(){public void addCorsMappings(CorsRegistry registry){registry.addMapping("/api/**").allowedOrigins(origin,"http://localhost:5173","http://127.0.0.1:3000","http://127.0.0.1:5173").allowedMethods("GET","POST","PUT","DELETE","OPTIONS").allowedHeaders("Content-Type","X-Cinebook-Client").allowCredentials(true).maxAge(3600);}};
 }
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
}

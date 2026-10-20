package lk.cinebook;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:lan_cors;MODE=MySQL;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa", "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "cinebook.allowed-origin=http://192.168.1.50:3000"
})
@AutoConfigureMockMvc
class LanCorsTest {
    @Autowired MockMvc mvc;

    @Test void configuredLanOriginSupportsCredentials() throws Exception {
        mvc.perform(options("/api/auth/me")
            .header("Origin", "http://192.168.1.50:3000")
            .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk())
            .andExpect(header().string("Access-Control-Allow-Origin", "http://192.168.1.50:3000"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test void unrelatedOriginIsRejected() throws Exception {
        mvc.perform(options("/api/auth/me")
            .header("Origin", "http://192.168.1.99:3000")
            .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isForbidden())
            .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}

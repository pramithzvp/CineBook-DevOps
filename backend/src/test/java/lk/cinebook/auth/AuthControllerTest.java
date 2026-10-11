package lk.cinebook.auth;

import lk.cinebook.auth.model.AppUser;
import lk.cinebook.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:cinebook;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver"
})
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder passwordEncoder;

    @BeforeEach
    void clearUsers() {
        users.deleteAll();
    }

    @Test
    void registrationLoginSessionLogoutAndMovieApiWork() throws Exception {
        String registerBody = """
                {"name":"John Doe","email":"JOHN@example.com","password":"password123"}
                """;

        var registration = mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();

        AppUser saved = users.findByEmail("john@example.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertNotEquals("password123", saved.getPasswordHash());
        org.junit.jupiter.api.Assertions.assertTrue(passwordEncoder.matches("password123", saved.getPasswordHash()));
        org.junit.jupiter.api.Assertions.assertNotNull(saved.getCreatedAt());
        org.junit.jupiter.api.Assertions.assertTrue(saved.getPasswordHash().startsWith("$2"));

        MockHttpSession registerSession = (MockHttpSession) registration.getRequest().getSession(false);
        mvc.perform(get("/api/auth/me").session(registerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@example.com"));

        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isConflict());

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"john@example.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(containsString("Invalid email or password")));

        var login = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\" JOHN@example.com \",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();
        MockHttpSession loginSession = (MockHttpSession) login.getRequest().getSession(false);
        mvc.perform(get("/api/auth/me").session(loginSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()));

        mvc.perform(post("/api/auth/logout").session(loginSession))
                .andExpect(status().isOk());
        mvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        mvc.perform(get("/api/movies")).andExpect(status().isOk());
    }

    @Test
    void invalidRegistrationAndAnonymousMeReturnClientErrors() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"J\",\"email\":\"not-an-email\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest());
    }

        @Test
        void frontendOriginCanUseCredentialedSessionRequests() throws Exception {
                mvc.perform(options("/api/auth/me")
                                                .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                                                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                                .andExpect(status().isOk())
                                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
        }

    @Test
    void missingMovieIsNotFoundAndHealthChecksDatabase() throws Exception {
        mvc.perform(get("/api/movies/9223372036854775807")).andExpect(status().isNotFound());
        mvc.perform(get("/api/health")).andExpect(status().isOk())
            .andExpect(jsonPath("$.application").value("CineBook"))
            .andExpect(jsonPath("$.database").value("UP"));
    }

    @Test
    void localFrontendCanSendBookingClientHeader() throws Exception {
        for (String origin : new String[]{"http://localhost:3000", "http://127.0.0.1:3000"}) {
            mvc.perform(options("/api/bookings")
                .header(HttpHeaders.ORIGIN, origin)
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type,x-cinebook-client"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin));
        }
    }
}

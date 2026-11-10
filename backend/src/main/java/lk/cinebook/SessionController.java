package lk.cinebook;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/session")
public class SessionController {
    @PostMapping
    public Map<String, Object> createOrRefresh(HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        BookingSession.ownerKey(session);
        return Map.of("active", true, "expiresInDays", 30);
    }
}

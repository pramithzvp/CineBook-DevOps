package lk.cinebook;

import jakarta.servlet.http.HttpSession;

import java.util.UUID;

final class BookingSession {
    private static final String USER_ID = "USER_ID";
    private static final String GUEST_OWNER_KEY = "CINEBOOK_GUEST_OWNER_KEY";
    private static final int GUEST_SESSION_SECONDS = 30 * 24 * 60 * 60;

    private BookingSession() {}

    static String ownerKey(HttpSession session) {
        session.setMaxInactiveInterval(GUEST_SESSION_SECONDS);
        Object userId = session.getAttribute(USER_ID);
        if (userId instanceof Long id) return "user:" + id;

        Object guestKey = session.getAttribute(GUEST_OWNER_KEY);
        String key;
        if (guestKey instanceof String existingKey) {
            key = existingKey;
        } else {
            key = UUID.randomUUID().toString();
            session.setAttribute(GUEST_OWNER_KEY, key);
        }
        return "guest:" + key;
    }
}

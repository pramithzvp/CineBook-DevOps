package lk.cinebook.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lk.cinebook.auth.dto.LoginRequest;
import lk.cinebook.auth.dto.RegisterRequest;
import lk.cinebook.auth.dto.UserResponse;
import lk.cinebook.auth.service.AuthService;
import lk.cinebook.auth.service.UnauthenticatedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String USER_ID = "USER_ID";
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletRequest servletRequest) {
        UserResponse user = authService.register(request);
        servletRequest.getSession(true).setAttribute(USER_ID, user.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request,
                              HttpServletRequest servletRequest) {
        UserResponse user = authService.login(request);
        HttpSession existing = servletRequest.getSession(false);
        if (existing != null) existing.invalidate();
        servletRequest.getSession(true).setAttribute(USER_ID, user.id());
        return user;
    }

    @GetMapping("/me")
    public UserResponse me(HttpServletRequest servletRequest) {
        HttpSession session = servletRequest.getSession(false);
        if (session == null) throw new UnauthenticatedException();
        Object userId = session.getAttribute(USER_ID);
        if (!(userId instanceof Long id)) throw new UnauthenticatedException();
        return authService.getUserById(id);
    }

    @PostMapping("/logout")
    public Map<String, String> logout(HttpServletRequest servletRequest) {
        HttpSession session = servletRequest.getSession(false);
        if (session != null) session.invalidate();
        return Map.of("message", "Logged out successfully.");
    }
}
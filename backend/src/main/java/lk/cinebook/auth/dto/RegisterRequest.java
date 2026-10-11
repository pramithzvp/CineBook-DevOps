package lk.cinebook.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Locale;

public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 100) String name,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(min = 8, max = 72) String password
) {
        public RegisterRequest {
                if (name != null) name = name.trim();
                if (email != null) email = email.trim().toLowerCase(Locale.ROOT);
        }
}
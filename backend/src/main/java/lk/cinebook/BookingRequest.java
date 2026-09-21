package lk.cinebook;
import jakarta.validation.constraints.*;
import java.util.List;
public record BookingRequest(
 @NotBlank String movieId,
 @NotBlank String date,
 @NotBlank String time,
 @NotBlank String cinema,
 @NotNull @Size(min=1,max=8) List<@NotBlank @Pattern(regexp="[A-H][1-8]") String> seats,
 @NotBlank @Size(max=100) String name,
 @NotBlank @Email @Size(max=200) String email
) {}

package lk.cinebook.auth.service;

public class UnauthenticatedException extends RuntimeException {
    public UnauthenticatedException() {
        super("Authentication required.");
    }
}
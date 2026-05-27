package com.herman.springcloud.msvc.payments_billing_service.msvc_payments_billing_service.payments.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtTokenValidator {
    private static final Pattern USER_ID_PATTERN = Pattern.compile("\"user_id\"\\s*:\\s*\"?(\\d+)\"?");
    private static final Pattern RESTAURANT_ID_PATTERN = Pattern.compile("\"restaurant_id\"\\s*:\\s*\"?(\\d+)\"?");
    private static final Pattern ROLE_PATTERN = Pattern.compile("\"role\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern EXP_PATTERN = Pattern.compile("\"exp\"\\s*:\\s*(\\d+)");

    private final String secret;

    public JwtTokenValidator(@Value("${payments.security.jwt.secret}") String secret) {
        this.secret = secret;
    }

    public Optional<AuthenticatedUser> validate(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return Optional.empty();
            }
            String expectedSignature = sign(parts[0] + "." + parts[1]);
            if (!constantTimeEquals(expectedSignature, parts[2])) {
                return Optional.empty();
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Long expiration = extractLong(EXP_PATTERN, payload);
            if (expiration == null || Instant.now().getEpochSecond() >= expiration) {
                return Optional.empty();
            }
            Long userId = extractLong(USER_ID_PATTERN, payload);
            Long restaurantId = extractLong(RESTAURANT_ID_PATTERN, payload);
            String role = extractString(ROLE_PATTERN, payload);
            if (userId == null || role == null || role.isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new AuthenticatedUser(userId, role, restaurantId));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private String sign(String content) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] signature = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
    }

    private boolean constantTimeEquals(String expected, String actual) {
        byte[] expectedBytes = expected.getBytes(StandardCharsets.UTF_8);
        byte[] actualBytes = actual.getBytes(StandardCharsets.UTF_8);
        if (expectedBytes.length != actualBytes.length) {
            return false;
        }
        int result = 0;
        for (int index = 0; index < expectedBytes.length; index++) {
            result |= expectedBytes[index] ^ actualBytes[index];
        }
        return result == 0;
    }

    private Long extractLong(Pattern pattern, String payload) {
        Matcher matcher = pattern.matcher(payload);
        return matcher.find() ? Long.parseLong(matcher.group(1)) : null;
    }

    private String extractString(Pattern pattern, String payload) {
        Matcher matcher = pattern.matcher(payload);
        return matcher.find() ? matcher.group(1) : null;
    }

    public record AuthenticatedUser(Long id, String role, Long restaurantId) {
    }
}

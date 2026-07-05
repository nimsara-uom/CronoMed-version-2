package com.smartcare.backend.security;

import com.smartcare.backend.model.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long validityInMs;

    private Key key;

    @PostConstruct
    protected void init() {
        // #2 — Fail fast: if JWT_SECRET is absent or too short for HS256 (< 256 bits / 32 bytes),
        // the WeakKeyException propagates and prevents the application from starting.
        // This catches misconfiguration early rather than silently using a random key
        // (which would invalidate all tokens on every restart without warning).
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ex) {
            // Not Base64 — treat as raw UTF-8 string (common in dev via env var)
            keyBytes = secret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        }
        // Throws WeakKeyException if keyBytes < 32 bytes — intentionally not caught
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, Role role) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("role", role.name());

        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMs);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().getSubject();
    }

    public Role getRole(String token) {
        String r = (String) Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody().get("role");
        return Role.valueOf(r);
    }
}

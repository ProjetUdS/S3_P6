package ca.usherbrooke.fgen.api.service;

import io.quarkus.oidc.AccessTokenCredential;
import io.quarkus.oidc.TenantIdentityProvider;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;
import java.time.Duration;

@ApplicationScoped
public class WebSocketAuthenticator {

    private static final Logger LOG = Logger.getLogger(WebSocketAuthenticator.class);

    @Inject
    TenantIdentityProvider identityProvider;

    public String verifyAndGetCip(String token) {
        if (token == null || token.isEmpty()) return null;
        try {
            SecurityIdentity identity = identityProvider
                    .authenticate(new AccessTokenCredential(token))
                    .await().atMost(Duration.ofSeconds(10));
            if (identity.getPrincipal() instanceof JsonWebToken jwt) {
                return jwt.getClaim("cip");
            }
            return null;
        } catch (Exception e) {
            LOG.warnf("WebSocket token verification failed: %s", e.getMessage());
            return null;
        }
    }
}
package ca.usherbrooke.fgen.api.service;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class WebSocketHelper {

    public static String extractQueryParam(String query, String name) {
        if (query == null || query.isEmpty()) return null;
        for (String param : query.split("&")) {
            String[] parts = param.split("=", 2);
            if (parts.length == 2 && parts[0].equals(name)) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }
}

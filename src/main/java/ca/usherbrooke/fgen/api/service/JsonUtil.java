package ca.usherbrooke.fgen.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.jboss.logging.Logger;

import java.util.Map;

public final class JsonUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Logger LOG = Logger.getLogger(JsonUtil.class);

    private JsonUtil() {}

    public static ObjectMapper getMapper() {
        return MAPPER;
    }

    public static String toJson(Map<String, String> fields) {
        try {
            ObjectNode node = MAPPER.createObjectNode();
            fields.forEach(node::put);
            return MAPPER.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            LOG.error("Failed to build JSON", e);
            return "{}";
        }
    }
}

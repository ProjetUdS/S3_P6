import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class testExample {
    @Test
    public void test() {
        String expected = "result";
        String actual = "result";

        assert expected.equals(actual);
    }
}
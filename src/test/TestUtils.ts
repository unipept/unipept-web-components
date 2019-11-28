export default class TestUtils {
    static sleep(ms): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
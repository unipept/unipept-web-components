export default class DateUtils {
    public static convertToDMYString(input: Date): string {
        return input.getDate() + "-" + (input.getMonth() + 1) + "-" + input.getFullYear();
    }
}

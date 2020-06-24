/**
 * A class that supports long-running operations should be cancellable at any time. By implementing this interface, the
 * class should provide a method `cancel` that stops it's long-running process as soon as possible (might not be
 * immediately, depending on the current task it is performing).
 *
 * @author Pieter Verschaffelt
 */
export default interface Cancellable {
    cancel(): void;
}

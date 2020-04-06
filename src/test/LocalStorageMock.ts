/**
 * Simple mock implementation for LocalStorage in modern browsers. Each of the functions here can be inspected by Jest.
 * All operations that can be performed on the local storage are supported. Instead of storing data persistent, all
 * data written is stored in memory.
 *
 * @author Pieter Verschaffelt
 */
export default class LocalStorageMock {
    store = {};

    clear() {
        this.store = {};
    }

    key(n) {
        return this.store[Object.keys[n]];
    }

    getItem(key) {
        return this.store[key];
    }

    setItem(key, value) {
        this.store[key] = value;
    }

    removeItem(key) {
        delete this.store[key];
    }

    get length() {
        return Object.keys(this.store).length;
    }
}

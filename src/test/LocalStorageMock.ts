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
